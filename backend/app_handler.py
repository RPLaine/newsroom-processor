import json
import os
import time
from uuid import uuid4
import requests

# Import handlers from new modular structure
from backend.application.job_handlers import (
    handle_create_job, 
    handle_continue_job, 
    handle_get_jobs, 
    handle_delete_job
)
from backend.application.input_handlers import (
    handle_search_web,
    handle_read_rss,
    handle_load_file
)
from backend.application.process_handlers import (
    handle_process_data,
    handle_save_output
)
from backend.application.utils import send_to_dolphin_llm

def handle_app_actions(response, cookie, config):
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
    
    if action == "create_job":
        return handle_create_job(response, user_id, request_data)
    elif action == "continue_job":
        return handle_continue_job(response, user_id, request_data)
    elif action == "get_jobs":
        return handle_get_jobs(response, user_id)
    elif action == "delete_job":
        return handle_delete_job(response, user_id, request_data)
    elif action == "search_web":
        return handle_search_web(response, user_id, request_data)
    elif action == "read_rss":
        return handle_read_rss(response, user_id, request_data)
    elif action == "load_file":
        return handle_load_file(response, user_id, request_data)
    elif action == "process_data":
        return handle_process_data(response, user_id, request_data)
    elif action == "save_output":
        return handle_save_output(response, user_id, request_data)
    elif action == "application_init":
        # Just return the current response for init action
        response["status"] = "success"
        return response
    else:
        response["status"] = "error"
        response["message"] = f"Unknown application action: {action}"
        return response