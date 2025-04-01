"""
Output Handler Module

This module handles saving and managing generated outputs for document generation jobs.
"""

import json
import os
import time
from .utils import get_user_data_path, save_user_data, find_job_by_id

def handle_save_output(response, user_id, request_data):
    """
    Handle saving generated output
    
    Args:
        response: The response dictionary
        user_id: The user ID
        request_data: The request data containing output content
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Extract output data
        job_id = request_data.get("job_id")
        file_name = request_data.get("file_name", "")
        content = request_data.get("content", "")
        
        if not job_id:
            response["status"] = "error"
            response["message"] = "Job ID is required"
            return response
            
        if not file_name:
            response["status"] = "error"
            response["message"] = "File name is required"
            return response
            
        if not content:
            response["status"] = "error"
            response["message"] = "Content is required"
            return response
            
        # Load user data
        user_data_path = get_user_data_path(user_id)
        
        if not os.path.exists(user_data_path):
            response["status"] = "error"
            response["message"] = "User data not found"
            return response
            
        with open(user_data_path, 'r') as f:
            user_data = json.load(f)
            
        # Find the job
        job, job_index = find_job_by_id(user_data, job_id)
                
        if not job:
            response["status"] = "error"
            response["message"] = "Job not found"
            return response
            
        # Add to outputs
        if "outputs" not in job:
            job["outputs"] = []
            
        # Check if output with same name exists and update it
        output_exists = False
        for i, output in enumerate(job["outputs"]):
            if output["file_name"] == file_name:
                job["outputs"][i] = {
                    "file_name": file_name,
                    "content": content,
                    "timestamp": int(time.time())
                }
                output_exists = True
                break
                
        if not output_exists:
            # Add new output
            job["outputs"].append({
                "file_name": file_name,
                "content": content,
                "timestamp": int(time.time())
            })
            
        # Update job in user data
        job["last_modified"] = int(time.time())
        user_data["jobs"][job_index] = job
        
        # Save updated user data
        save_user_data(user_id, user_data)
        
        # Set response
        response["status"] = "success"
        response["message"] = "Output saved successfully"
        response["data"] = {
            "job": job
        }
        
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to save output: {str(e)}"
        return response