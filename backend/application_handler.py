import backend.application.johto_handler as johto_handler
import backend.application.process_handler as process_handler

def handle_application_actions(response: dict) -> dict:
    if 'action' not in response['request']:
        response['status'] = 'error'
        response['message'] = 'No action specified'
        return response
    
    action = response['request']['action']
    user_id = response.get('userid', None)
    
    if not user_id:
        response['status'] = 'error'
        response['message'] = 'Not authenticated'
        return response
    
    if action == 'load_johto_data':
        return johto_handler.handle_load_johto_data(response)
    
    if action == 'start_process':
        return process_handler.start_process(response)
    
    if action == 'get_process_status':
        return process_handler.get_process_status(response['request'])
    
    if action == 'process_data':
        return process_handler.handle_process_request(response['request'])
    
    response['status'] = 'error'
    response['message'] = f'Unknown application action: {action}'
    return response