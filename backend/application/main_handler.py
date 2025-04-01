"""
Main Application Handler

This module serves as the entry point for application actions, routing each request
to the appropriate specialized handler module.
"""

from .job_handler import (
    handle_create_job,
    handle_continue_job,
    handle_get_jobs,
    handle_delete_job
)

from .input_handler import (
    handle_search_web,
    handle_read_rss,
    handle_load_file
)

from .process_handler import handle_process_data
from .output_handler import handle_save_output

def route_app_actions(response, cookie, config):
    """
    Route application actions to the appropriate handler
    
    Args:
        response: Response object containing request data
        cookie: Cookie object for session management
        config: Server configuration
        
    Returns:
        Updated response object
    """
    action = response["request"]["action"]
    user_id = response.get("userid")
    request_data = response["request"]
    
    # Job management actions
    if action == "create_job":
        return handle_create_job(response, user_id, request_data)
    elif action == "continue_job":
        return handle_continue_job(response, user_id, request_data)
    elif action == "get_jobs":
        return handle_get_jobs(response, user_id)
    elif action == "delete_job":
        return handle_delete_job(response, user_id, request_data)
    
    # Input handling actions
    elif action == "search_web":
        return handle_search_web(response, user_id, request_data)
    elif action == "read_rss":
        return handle_read_rss(response, user_id, request_data)
    elif action == "load_file":
        return handle_load_file(response, user_id, request_data)
    
    # Processing actions
    elif action == "process_data":
        return handle_process_data(response, user_id, request_data)
    
    # Output actions
    elif action == "save_output":
        return handle_save_output(response, user_id, request_data)
    
    # Application initialization
    elif action == "application_init":
        # Just return the current response for init action
        response["status"] = "success"
        return response
    
    # Unknown action
    else:
        response["status"] = "error"
        response["message"] = f"Unknown application action: {action}"
        return response