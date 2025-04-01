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
    
    # insert handlers
    
    response['status'] = 'error'
    response['message'] = f'Unknown application action: {action}'
    return response