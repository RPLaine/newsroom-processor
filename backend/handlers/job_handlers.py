"""
Job handlers for managing jobs in the application
"""
import time
import os
from uuid import uuid4

from backend.handlers.base_handler import BaseHandler
from backend.utils.response_utils import create_success_response, create_error_response
from backend.utils.file_utils import load_data, save_data, ensure_directory

class CreateJobHandler(BaseHandler):
    """Handler for creating a new job"""
    
    def validate_request(self, request_data):
        """Validate job creation request"""
        if not request_data.get("name"):
            return False, "Job name is required"
        return True, None
    
    def process(self, response, request_data):
        """Process job creation request"""
        job_id = str(uuid4())
        job_name = request_data.get("name")
        timestamp = int(time.time())
        
        # Create job directory and data
        if not self.user_id:
            return create_error_response("User ID is required")
        
        user_jobs_dir = f"data/users/{self.user_id}/jobs"
        job_dir = f"{user_jobs_dir}/{job_id}"
        
        if not ensure_directory(job_dir):
            return create_error_response("Failed to create job directory")
        
        # Create job data
        job_data = {
            "id": job_id,
            "name": job_name,
            "created_at": timestamp,
            "inputs": [],
            "conversation": [],
            "outputs": []
        }
        
        # Save job data
        if not save_data(f"{job_dir}/data.json", job_data):
            return create_error_response("Failed to save job data")
        
        # Update user's job list
        user_data_path = f"data/users/{self.user_id}/data.json"
        user_data = load_data(user_data_path, {"jobs": []})
        
        if "jobs" not in user_data:
            user_data["jobs"] = []
            
        # Add job to user's job list if not already present
        if job_id not in [job.get("id") for job in user_data["jobs"]]:
            user_data["jobs"].append({
                "id": job_id,
                "name": job_name,
                "created_at": timestamp
            })
            
            # Save updated user data
            if not save_data(user_data_path, user_data):
                return create_error_response("Failed to update user data")
        
        # Return success response
        return create_success_response({
            "job_id": job_id,
            "timestamp": timestamp
        }, "Job created successfully")


class GetJobsHandler(BaseHandler):
    """Handler for retrieving user's jobs"""
    
    def process(self, response, request_data):
        """Process get jobs request"""
        if not self.user_id:
            return create_error_response("User ID is required")
        
        # Load user data
        user_data_path = f"data/users/{self.user_id}/data.json"
        user_data = load_data(user_data_path, {"jobs": []})
        
        jobs = user_data.get("jobs", [])
        
        # Return success with jobs list
        return create_success_response({
            "jobs": jobs
        }, "Jobs retrieved successfully")


class DeleteJobHandler(BaseHandler):
    """Handler for deleting a job"""
    
    def validate_request(self, request_data):
        """Validate job deletion request"""
        if not request_data.get("job_id"):
            return False, "Job ID is required"
        return True, None
    
    def process(self, response, request_data):
        """Process job deletion request"""
        if not self.user_id:
            return create_error_response("User ID is required")
            
        job_id = request_data.get("job_id")
        
        # Update user's job list
        user_data_path = f"data/users/{self.user_id}/data.json"
        user_data = load_data(user_data_path, {"jobs": []})
        
        # Remove job from user's job list
        user_data["jobs"] = [job for job in user_data.get("jobs", []) if job.get("id") != job_id]
        
        # Save updated user data
        if not save_data(user_data_path, user_data):
            return create_error_response("Failed to update user data")
            
        # Return success
        return create_success_response(message="Job deleted successfully")


class ContinueJobHandler(BaseHandler):
    """Handler for continuing/loading an existing job"""
    
    def validate_request(self, request_data):
        """Validate job continuation request"""
        if not request_data.get("job_id"):
            return False, "Job ID is required"
        return True, None
    
    def process(self, response, request_data):
        """Process job continuation request"""
        if not self.user_id:
            return create_error_response("User ID is required")
            
        job_id = request_data.get("job_id")
        
        # Load job data
        job_path = f"data/users/{self.user_id}/jobs/{job_id}/data.json"
        job_data = load_data(job_path)
        
        if not job_data:
            return create_error_response("Job not found")
            
        # Return success with job data
        return create_success_response({
            "job": job_data
        }, "Job loaded successfully")