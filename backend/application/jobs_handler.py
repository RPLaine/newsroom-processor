import time
import os
import shutil
from uuid import uuid4
import backend.file_handler as file_handler
import backend.structure_interpreter as structure_interpreter

def handle_get_jobs(response: dict, user_id: str) -> dict:
    """Handle the get_jobs action to retrieve all jobs for a user"""
    user_data = file_handler.load_user_data(user_id)
    
    response['status'] = 'success'
    response['message'] = 'Jobs retrieved successfully'
    response['data'] = {
        'jobs': user_data.get('jobs', [])
    }
    
    return response

def handle_create_job(response: dict, user_id: str) -> dict:
    """Handle the create_job action to create a new job"""
    request = response['request']
    
    if 'name' not in request:
        response['status'] = 'error'
        response['message'] = 'Job name is required'
        return response
    
    job_name = request['name']
    job_id = str(uuid4())
    timestamp = time.time()
    
    # Create job data structure
    new_job = {
        'id': job_id,
        'name': job_name,
        'created_at': timestamp,
        'description': '',
        'inputs': [],
        'outputs': [],
        'conversation': []
    }
    
    # Update user data
    user_data = file_handler.load_user_data(user_id)
    if 'jobs' not in user_data:
        user_data['jobs'] = []
    
    user_data['jobs'].append(new_job)
    
    # Save user data
    if file_handler.save_user_data(user_id, user_data):
        # Create job directory and job data file
        structure_interpreter.create_job(user_id, job_id, new_job)
        
        response['status'] = 'success'
        response['message'] = 'Job created successfully'
        response['job_id'] = job_id
        response['timestamp'] = timestamp
    else:
        response['status'] = 'error'
        response['message'] = 'Failed to create job'
    
    return response

def handle_delete_job(response: dict, user_id: str) -> dict:
    """Handle the delete_job action to delete a job"""
    request = response['request']
    
    if 'job_id' not in request:
        response['status'] = 'error'
        response['message'] = 'Job ID is required'
        return response
    
    job_id = request['job_id']
    
    # Update user data
    user_data = file_handler.load_user_data(user_id)
    if 'jobs' not in user_data:
        user_data['jobs'] = []
    
    # Find and remove the job
    updated_jobs = [job for job in user_data['jobs'] if job.get('id') != job_id]
    
    if len(updated_jobs) == len(user_data['jobs']):
        response['status'] = 'error'
        response['message'] = 'Job not found'
        return response
    
    user_data['jobs'] = updated_jobs
    
    # Save user data
    if file_handler.save_user_data(user_id, user_data):
        # Delete job directory
        job_dir = os.path.join('data', 'users', user_id, 'jobs', job_id)
        try:
            if os.path.exists(job_dir):
                shutil.rmtree(job_dir)
        except Exception as e:
            # Log error but continue
            print(f"Error removing job directory: {e}")
        
        response['status'] = 'success'
        response['message'] = 'Job deleted successfully'
    else:
        response['status'] = 'error'
        response['message'] = 'Failed to delete job'
    
    return response