import backend.application.johto_handler as johto_handler
import backend.application.process_handler as process_handler
import backend.application.choose_next_node as choose_next_node
import backend.application.execute_node as execute_node

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
    
    if action == 'start_process':
        return process_handler.start_process(request)
    
    if action == 'get_process_status':
        return process_handler.get_process_status(request['request'])
    
    if action == 'choose_next_node':
        return choose_next_node.handle_choose_next_node(request)
    
    if action == 'execute_node':
        return execute_node.handle_execute_node(request)
    
    if action == 'get_output_files':
        structure_id = request['request'].get('structure_id')
        if not structure_id:
            request['status'] = 'error'
            request['message'] = 'Missing structure_id parameter'
            return request
            
        files = execute_node.get_output_files(user_id, structure_id)
        request['status'] = 'success'
        request['data'] = {'files': files}
        return request
    
    if action == 'delete_output_file':
        structure_id = request['request'].get('structure_id')
        file_id = request['request'].get('file_id')
        
        if not structure_id or not file_id:
            request['status'] = 'error'
            request['message'] = 'Missing required parameters'
            return request
            
        success = execute_node.delete_output_file(user_id, structure_id, file_id)
        
        if success:
            request['status'] = 'success'
            request['message'] = 'File deleted successfully'
        else:
            request['status'] = 'error'
            request['message'] = 'Failed to delete file'
            
        return request
    
    if action == 'delete_all_output_files':
        structure_id = request['request'].get('structure_id')
        
        if not structure_id:
            request['status'] = 'error'
            request['message'] = 'Missing structure_id parameter'
            return request
            
        success = execute_node.delete_all_output_files(user_id, structure_id)
        
        if success:
            request['status'] = 'success'
            request['message'] = 'All output files moved to old/ directory'
        else:
            request['status'] = 'error'
            request['message'] = 'Failed to move output files'
            
        return request
    
    request['status'] = 'error'
    request['message'] = f'Unknown application action: {action}'
    return request