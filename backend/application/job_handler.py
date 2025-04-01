"""
Job Management Module

This module handles the creation, retrieval, modification, and deletion of document generation jobs.
"""

import json
import os
import time
from uuid import uuid4
from .utils import get_user_data_path, save_user_data, find_job_by_id, send_to_dolphin_llm

def handle_create_job(response, user_id, request_data):
    """
    Handle job creation request
    
    Args:
        response: The response dictionary
        user_id: The user ID
        request_data: The request data containing job details
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Extract job data from request
        title = request_data.get("title", "")
        description = request_data.get("description", "")
        job_type = request_data.get("job_type", "document")
        
        if not title:
            response["status"] = "error"
            response["message"] = "Job title is required"
            return response
            
        # Create job data structure
        job_id = str(uuid4())
        job_data = {
            "id": job_id,
            "title": title,
            "description": description,
            "type": job_type,
            "inputs": [],
            "conversation": [],
            "outputs": [],
            "created_at": int(time.time()),
            "last_modified": int(time.time())
        }
        
        # Save job to user data
        user_data_path = get_user_data_path(user_id)
        
        if os.path.exists(user_data_path):
            # Load existing user data
            with open(user_data_path, 'r') as f:
                user_data = json.load(f)
                
            # Add job to user's jobs
            if "jobs" not in user_data:
                user_data["jobs"] = []
                
            user_data["jobs"].append(job_data)
            
            # Save updated user data
            save_user_data(user_id, user_data)
                
            # Set response
            response["status"] = "success"
            response["message"] = "Job created successfully"
            response["data"] = {"job": job_data}
        else:
            response["status"] = "error"
            response["message"] = "User data not found"
            
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to create job: {str(e)}"
        return response

def handle_continue_job(response, user_id, request_data):
    """
    Handle job continuation request
    
    Args:
        response: The response dictionary
        user_id: The user ID
        request_data: The request data containing continuation details
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Extract continuation data
        job_id = request_data.get("job_id")
        user_prompt = request_data.get("user_prompt", "")
        
        if not job_id:
            response["status"] = "error"
            response["message"] = "Job ID is required"
            return response
            
        if not user_prompt:
            response["status"] = "error"
            response["message"] = "User prompt is required"
            return response
            
        # Load user data
        user_data_path = get_user_data_path(user_id)
        
        if not os.path.exists(user_data_path):
            response["status"] = "error"
            response["message"] = "User data not found"
            return response
            
        with open(user_data_path, 'r') as f:
            user_data = json.load(f)
            
        # Find the job by ID
        job, job_index = find_job_by_id(user_data, job_id)
                
        if not job:
            response["status"] = "error"
            response["message"] = "Job not found"
            return response
            
        # Format message with im_start format
        formatted_prompt = f"<|im_start|>user\n{user_prompt}<|im_end|>"
        
        # Send to LLM
        llm_response = send_to_dolphin_llm(formatted_prompt, job.get("conversation", []))
        
        # Add to conversation
        if "conversation" not in job:
            job["conversation"] = []
            
        job["conversation"].append({
            "role": "user",
            "content": user_prompt,
            "timestamp": int(time.time())
        })
        
        job["conversation"].append({
            "role": "assistant",
            "content": llm_response,
            "timestamp": int(time.time())
        })
        
        job["last_modified"] = int(time.time())
        user_data["jobs"][job_index] = job
        
        # Save updated user data
        save_user_data(user_id, user_data)
            
        # Set response
        response["status"] = "success"
        response["message"] = "Job continued successfully"
        response["data"] = {
            "job": job,
            "assistant_response": llm_response
        }
        
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to continue job: {str(e)}"
        return response

def handle_get_jobs(response, user_id):
    """
    Handle request to get user's jobs
    
    Args:
        response: The response dictionary
        user_id: The user ID
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Load user data
        user_data_path = get_user_data_path(user_id)
        
        if not os.path.exists(user_data_path):
            response["status"] = "error"
            response["message"] = "User data not found"
            return response
            
        with open(user_data_path, 'r') as f:
            user_data = json.load(f)
            
        # Set response
        response["status"] = "success"
        response["message"] = "Jobs retrieved successfully"
        response["data"] = {
            "jobs": user_data.get("jobs", [])
        }
        
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to get jobs: {str(e)}"
        return response

def handle_delete_job(response, user_id, request_data):
    """
    Handle job deletion request
    
    Args:
        response: The response dictionary
        user_id: The user ID
        request_data: The request data containing job ID
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Extract job ID
        job_id = request_data.get("job_id")
        
        if not job_id:
            response["status"] = "error"
            response["message"] = "Job ID is required"
            return response
            
        # Load user data
        user_data_path = get_user_data_path(user_id)
        
        if not os.path.exists(user_data_path):
            response["status"] = "error"
            response["message"] = "User data not found"
            return response
            
        with open(user_data_path, 'r') as f:
            user_data = json.load(f)
            
        # Find and remove the job
        jobs = user_data.get("jobs", [])
        found = False
        
        for i, job in enumerate(jobs):
            if job["id"] == job_id:
                del jobs[i]
                found = True
                break
                
        if not found:
            response["status"] = "error"
            response["message"] = "Job not found"
            return response
            
        # Update user data
        user_data["jobs"] = jobs
        
        # Save updated user data
        save_user_data(user_id, user_data)
            
        # Set response
        response["status"] = "success"
        response["message"] = "Job deleted successfully"
        
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to delete job: {str(e)}"
        return response