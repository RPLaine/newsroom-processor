import backend.llm as llm
import json

def handle_choose_next_node(response: dict) -> dict:
    request = response.get('request')
    current_node = request.get('current_node')
    connections = request.get('connections')

    print('REQUEST:')
    print(json.dumps(request, indent=2))

    print('CURRENT NODE:')
    print(json.dumps(current_node, indent=2))

    print('CONNECTIONS:')
    print(json.dumps(connections, indent=2))

    # simpler dict for current node: node
    node = {}
    node['header'] = current_node.get('configuration', {}).get('header', '')
    node['prompt'] = current_node.get('configuration', {}).get('prompt', '')
    print(json.dumps(node, indent=2))

    # simpler dict for connections: con
    cons = []
    i = 0
    while i < len(connections):
        con = {}
        con['id'] = connections[i].get('id', '')
        con['header'] = connections[i].get('configuration', {}).get('header', '')
        con['prompt'] = connections[i].get('configuration', {}).get('prompt', '')
        cons.append(con)
        print()
        i += 1
    print(json.dumps(cons, indent=2))
    
    prompt = '''
<|im_system|>
You are a helpful assistant.
<|im_end|>
<|im_user|>
This is the current node:
''' + json.dumps(node, indent=2) + '''.

These are the possible next nodes:
''' + json.dumps(cons, indent=2) + '''.

Choose the next node based on the current node and the possible next nodes.

Provide the next node id in the following format:
{
    "next_node_id": <next_node_id>
}

Task: Return only a valid JSON object with the next_node_id.
<|im_end|>
<|im_assistant|>
    '''

    llm_response = llm.generate_llm_response(prompt)

    print('UNREFINED LLM RESPONSE:')
    print(llm_response.text)

    # Refine value
    value = llm_response.text.rsplit('<|im_assistant|>', 1)[-1].strip()
    value = value.rsplit('}', 1)[0] + '}' 

    print('REFINED LLM RESPONSE:')
    print(value)

    # try json
    try:
        value = json.loads(value)
    except json.JSONDecodeError:
        pass

    return value

if __name__ == '__main__':
    test_response = {
        'request': {
            'current_node': {
                'id': 'scene_forest',
                'configuration': {
                    'header': 'Dark Forest',
                    'prompt': 'You are standing in a dark, foggy forest. The trees tower above you, their branches creating eerie shadows.'
                }
            },
            'connections': [
                {
                    'id': 'scene_cabin',
                    'configuration': {
                        'header': 'Abandoned Cabin',
                        'prompt': 'A small wooden cabin appears through the fog. It looks abandoned, but there might be shelter inside.'
                    }
                },
                {
                    'id': 'scene_river',
                    'configuration': {
                        'header': 'Rushing River',
                        'prompt': 'You come across a rushing river cutting through the forest. The water is dark and swift.'
                    }
                },
                {
                    'id': 'scene_clearing',
                    'configuration': {
                        'header': 'Forest Clearing',
                        'prompt': 'The trees thin out to reveal a small clearing bathed in moonlight. The area seems peaceful.'
                    }
                }
            ]
        }
    }
    
    result = handle_choose_next_node(test_response)
    print(result)