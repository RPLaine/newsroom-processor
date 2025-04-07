import backend.application.johto_handler as johto_handler
import backend.application.process_handler as process_handler
import backend.application.choose_next_node as choose_next_node

def handle_application_actions(request: dict) -> dict:
    if 'action' not in request['request']:
        request['status'] = 'error'
        request['message'] = 'No action specified'
        return request
    
    action = request['request']['action']
    user_id = request.get('userid', None)
    
    if not user_id:
        request['status'] = 'error'
        request['message'] = 'Not authenticated'
        return request
    
    if action == 'load_johto_data':
        return johto_handler.handle_load_johto_data(request)
    
    # if action == 'start_process':
    #     return process_handler.start_process(response)
    
    # if action == 'get_process_status':
    #     return process_handler.get_process_status(response['request'])
    
    # if action == 'execute_node':
    #     return process_handler.handle_process_request(response['request'])
    
    # if action == 'process_data':
    #     return process_handler.handle_process_request(response['request'])

    if action == 'choose_next_node':
        return choose_next_node.handle_choose_next_node(request)
    
    request['status'] = 'error'
    request['message'] = f'Unknown application action: {action}'
    return request