import backend.file_handler as file_handler
import backend.structure_interpreter as structure_interpreter
import backend.application.jobs_handler as jobs_handler

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
    
    # Job-related actions
    if action == 'get_jobs':
        return jobs_handler.handle_get_jobs(response, user_id)
    elif action == 'create_job':
        return jobs_handler.handle_create_job(response, user_id)
    elif action == 'delete_job':
        return jobs_handler.handle_delete_job(response, user_id)
    
    response['status'] = 'error'
    response['message'] = f'Unknown application action: {action}'
    return response