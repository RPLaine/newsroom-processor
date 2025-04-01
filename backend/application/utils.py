"""
Utility Functions Module

This module provides common utility functions used across the document generation application.
"""

import json
import os
import requests

def get_user_data_path(user_id):
    """
    Get the path to the user's data file
    
    Args:
        user_id: The user ID
        
    Returns:
        The path to the user's data file
    """
    return os.path.join("data", "users", user_id, "data.json")

def save_user_data(user_id, user_data):
    """
    Save user data to file
    
    Args:
        user_id: The user ID
        user_data: The user data to save
        
    Returns:
        None
    """
    user_data_path = get_user_data_path(user_id)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(user_data_path), exist_ok=True)
    
    # Save data
    with open(user_data_path, 'w') as f:
        json.dump(user_data, f, indent=2)

def find_job_by_id(user_data, job_id):
    """
    Find a job by ID in the user data
    
    Args:
        user_data: The user data
        job_id: The job ID to find
        
    Returns:
        Tuple of (job, job_index) or (None, -1) if not found
    """
    for i, job in enumerate(user_data.get("jobs", [])):
        if job["id"] == job_id:
            return job, i
    
    return None, -1

def send_to_dolphin_llm(prompt, conversation_history=None):
    """
    Send a prompt to the Dolphin LLM server
    
    Args:
        prompt: The prompt to send
        conversation_history: Optional conversation history
        
    Returns:
        The LLM response text
    """
    try:
        url = 'http://localhost:5000'
        
        # Prepare context from conversation history
        context = ""
        if conversation_history:
            for message in conversation_history[-5:]:  # Use last 5 messages for context
                if message["role"] == "user":
                    context += f"<|im_start|>user\n{message['content']}<|im_end|>\n"
                elif message["role"] == "assistant":
                    context += f"<|im_start|>assistant\n{message['content']}<|im_end|>\n"
                elif message["role"] == "system":
                    context += f"<|im_start|>system\n{message['content']}<|im_end|>\n"
        
        # Add current prompt
        full_prompt = context + prompt
        
        payload = {
            'prompt': full_prompt,
            'max_length': 2000,
            'temperature': 0.7,
            'top_k': 50,
            'top_p': 0.9,
            'repetition_penalty': 1.1,
            'stream': False
        }
        
        response = requests.post(
            url,
            json=payload,
            headers={'Accept': 'application/json'}
        )
        
        response.raise_for_status()
        
        # Extract and return the response text
        response_json = response.json()
        return response_json.get('response', '')
        
    except requests.exceptions.ConnectionError:
        return "Error: Could not connect to the Dolphin LLM server. Make sure the server is running."
    except Exception as e:
        return f"Error communicating with LLM: {str(e)}"