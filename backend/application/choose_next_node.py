import backend.llm as llm
import json

async def handle_choose_next_node(response: dict) -> dict:
    request = response.get('request', {})
    current_node = request.get('current_node')
    connections = request.get('connections')
    
    if not current_node or not connections:
        response['status'] = 'error'
        response['message'] = 'Current node or graph not provided'
        return response
    
    prompt = '''
    <|im_system|>
    You are a helpful assistant.
    <|im_end|>
    <|im_user|>
    This is the current node:
    ''' + {json.dumps(current_node, indent=2)} + '''.
    These are the possible next nodes:
    ''' + {json.dumps(connections, indent=2)} + '''.
    Choose the next node based on the current node and the possible next nodes.
    Provide the next node in the format:
    {
        "next_node_id": <next_node_id>
    }
    '''

    llm_response = await llm.generate_llm_response(prompt)
    if llm_response is None:
        response['status'] = 'error'
        response['message'] = 'LLM response is None'
        return response
    if json.loads(llm_response) is None:
        response['status'] = 'error'
        response['message'] = 'LLM response is invalid JSON'
        response['llm_response'] = llm_response
        return response
    
    response ['status'] = 'success'
    response ['message'] = 'LLM response received'
    response ['llm_response'] = json.loads(llm_response)
    response ['nextNodeID'] = json.loads(llm_response).get('next_node_id')
    return response