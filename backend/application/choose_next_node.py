import backend.llm as llm
import json

def handle_choose_next_node(response: dict) -> dict:
    request = response.get('request', {})
    current_node = request.get('current_node')
    connections = request.get('connections')
    
    prompt = '''
<|im_system|>
You are a helpful assistant.
<|im_end|>
<|im_user|>
This is the current node:
''' + json.dumps(current_node, indent=2) + '''.
These are the possible next nodes:
''' + json.dumps(connections, indent=2) + '''.
Choose the next node based on the current node and the possible next nodes.
Provide the next node in the format:
{
    "next_node_id": <next_node_id>
}
Only return a valid JSON object with the next_node_id field and nothing else.
<|im_end|>
<|im_assistant|>
    '''

    llm_response = llm.generate_llm_response(prompt)

    # Refine value
    value = llm_response.text.rsplit('<|im_assistant|>', 1)[-1].strip()
    value = value.rsplit('}', 1)[0] + '}' 

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
                'type': 'scene',
                'title': 'Dark Forest',
                'description': 'You are standing in a dark, foggy forest. The trees tower above you, their branches creating eerie shadows.',
                'tags': ['scary', 'forest', 'night'],
                'position': {'x': 100, 'y': 200}
            },
            'connections': [
                {
                    'id': 'scene_cabin',
                    'type': 'scene',
                    'title': 'Abandoned Cabin',
                    'description': 'A small wooden cabin appears through the fog. It looks abandoned, but there might be shelter inside.',
                    'tags': ['shelter', 'mystery', 'building'],
                    'position': {'x': 250, 'y': 300}
                },
                {
                    'id': 'scene_river',
                    'type': 'scene',
                    'title': 'Rushing River',
                    'description': 'You come across a rushing river cutting through the forest. The water is dark and swift.',
                    'tags': ['water', 'obstacle', 'nature'],
                    'position': {'x': 150, 'y': 350}
                },
                {
                    'id': 'scene_clearing',
                    'type': 'scene',
                    'title': 'Forest Clearing',
                    'description': 'The trees thin out to reveal a small clearing bathed in moonlight. The area seems peaceful.',
                    'tags': ['safe', 'rest', 'open'],
                    'position': {'x': 50, 'y': 300}
                }
            ]
        }
    }
    
    result = handle_choose_next_node(test_response)
    print(result)