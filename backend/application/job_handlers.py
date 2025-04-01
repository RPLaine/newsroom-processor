"""
Job handlers for creating, continuing, retrieving and deleting jobs
"""
import json
import time
import os
from uuid import uuid4
from backend.user_handler import load_user_data

def handle_create_job(response, user_id, request_data):
    """
    Create a new job
    
    Args:
        response: Response object
        user_id: ID of the current user
        request_data: Request data containing job details
        
    Returns:
        Updated response with job creation results
    """
    try:
        # Get the job name from request data
        job_name = request_data.get("name")
        
        if not job_name:
            response["status"] = "error"
            response["message"] = "Job name is required"
            return response
            
        # Generate a unique job ID and timestamp
        job_id = str(uuid4())
        timestamp = time.time()
        
        # Create the job object with only a name
        new_job = {
            "id": job_id,
            "name": job_name,
            "created_at": timestamp
        }
        
        # Load the user's data
        user_data = load_user_data(user_id)
        
        # Add the new job to the user's jobs
        if "jobs" not in user_data:
            user_data["jobs"] = []
        
        user_data["jobs"].append(new_job)
        
        # Save the updated user data
        user_data_path = os.path.join("data", "users", user_id, "data.json")
        with open(user_data_path, "w") as file:
            json.dump(user_data, file, indent=2)
        
        # Set success response
        response["status"] = "success"
        response["job_id"] = job_id
        response["timestamp"] = timestamp
        
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Error creating job: {str(e)}"
    
    return response

def handle_continue_job(response, user_id, request_data):
    """
    Continue an existing job
    
    Args:
        response: Response object
        user_id: ID of the current user
        request_data: Request data containing job ID and continuation details
        
    Returns:
        Updated response with job continuation results
    """
    # Implementation for continuing a job
    job_id = request_data.get("job_id")
    response["status"] = "success"
    response["job_id"] = job_id
    response["timestamp"] = time.time()
    return response

def handle_get_jobs(response, user_id):
    """
    Get all jobs for a user
    
    Args:
        response: Response object
        user_id: ID of the current user
        
    Returns:
        Updated response with list of jobs
    """
    try:
        # Load the user's data.json file
        user_data = load_user_data(user_id)
        
        # Get the jobs array from user data
        jobs = user_data.get("jobs", [])
        
        # Structure the response to match frontend expectations
        response["status"] = "success"
        response["data"] = {
            "jobs": jobs
        }
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Error loading jobs: {str(e)}"
    
    return response

def handle_delete_job(response, user_id, request_data):
    """
    Delete a job
    
    Args:
        response: Response object
        user_id: ID of the current user
        request_data: Request data containing job ID
        
    Returns:
        Updated response with deletion status
    """
    try:
        # Get the job ID from request data
        job_id = request_data.get("job_id")
        
        if not job_id:
            response["status"] = "error"
            response["message"] = "Job ID is required"
            return response
            
        # Load the user's data
        user_data = load_user_data(user_id)
        
        # Find and remove the job from the user's jobs
        if "jobs" in user_data:
            # Find the job index
            job_index = None
            for i, job in enumerate(user_data["jobs"]):
                if job.get("id") == job_id:
                    job_index = i
                    break
            
            # Remove the job if found
            if job_index is not None:
                del user_data["jobs"][job_index]
                
                # Save the updated user data
                user_data_path = os.path.join("data", "users", user_id, "data.json")
                with open(user_data_path, "w") as file:
                    json.dump(user_data, file, indent=2)
                
                response["status"] = "success"
                response["message"] = f"Job {job_id} deleted successfully"
            else:
                response["status"] = "error"
                response["message"] = f"Job {job_id} not found"
        else:
            response["status"] = "error"
            response["message"] = "No jobs found for user"
            
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Error deleting job: {str(e)}"
    
    return response