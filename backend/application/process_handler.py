"""
Process Handler Module

This module handles data processing operations for document generation jobs,
including user prompts, automatic refinement, and self-reflection.
"""

import json
import os
import time
from .utils import get_user_data_path, save_user_data, find_job_by_id, send_to_dolphin_llm

def handle_process_data(response, user_id, request_data):
    """
    Handle data processing request
    
    Args:
        response: The response dictionary
        user_id: The user ID
        request_data: The request data containing processing parameters
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Extract processing data
        job_id = request_data.get("job_id")
        processing_type = request_data.get("processing_type", "prompt")
        prompt = request_data.get("prompt", "")
        
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
            
        # Find the job
        job, job_index = find_job_by_id(user_data, job_id)
                
        if not job:
            response["status"] = "error"
            response["message"] = "Job not found"
            return response
            
        # Process data based on processing type
        llm_response = ""
        
        if processing_type == "prompt":
            # Simple user prompt
            formatted_prompt = f"<|im_start|>user\n{prompt}<|im_end|>"
            llm_response = send_to_dolphin_llm(formatted_prompt, job.get("conversation", []))
            
            # Add to conversation
            if "conversation" not in job:
                job["conversation"] = []
                
            job["conversation"].append({
                "role": "user",
                "content": prompt,
                "timestamp": int(time.time())
            })
            
            job["conversation"].append({
                "role": "assistant",
                "content": llm_response,
                "timestamp": int(time.time())
            })
            
        elif processing_type == "refine":
            # Automatic refinement of inputs
            input_summary = "Based on the inputs provided:\n"
            
            for input_item in job.get("inputs", []):
                if input_item["type"] == "web_search":
                    input_summary += f"- Web search for '{input_item['query']}'\n"
                    for result in input_item.get("results", []):
                        input_summary += f"  • {result.get('title', 'Unknown')}: {result.get('snippet', 'No snippet available')}\n"
                elif input_item["type"] == "rss_feed":
                    input_summary += f"- RSS feed from {input_item['url']}\n"
                    for item in input_item.get("items", []):
                        input_summary += f"  • {item.get('title', 'Unknown')}: {item.get('description', 'No description available')}\n"
                elif input_item["type"] == "file":
                    input_summary += f"- File: {input_item['name']}\n"
                    # Add a snippet of the file content
                    content_preview = input_item.get("content", "")[:200]
                    if content_preview:
                        input_summary += f"  • Content preview: {content_preview}...\n"
            
            refine_prompt = f"<|im_start|>user\nPlease refine and organize the following information into a coherent document:\n{input_summary}<|im_end|>"
            llm_response = send_to_dolphin_llm(refine_prompt, job.get("conversation", []))
            
            # Add to conversation
            if "conversation" not in job:
                job["conversation"] = []
                
            job["conversation"].append({
                "role": "system",
                "content": "Automatic refinement of inputs",
                "timestamp": int(time.time())
            })
            
            job["conversation"].append({
                "role": "assistant",
                "content": llm_response,
                "timestamp": int(time.time())
            })
            
        elif processing_type == "reflect":
            # Self-reflection on progress
            conversation_summary = ""
            
            # Summarize the conversation so far
            if job.get("conversation"):
                conversation_summary = "Previous conversation:\n"
                for i, message in enumerate(job.get("conversation", [])[-10:]):  # Get last 10 messages
                    role = message.get("role", "unknown")
                    content_preview = message.get("content", "")[:100]
                    conversation_summary += f"{i+1}. {role.capitalize()}: {content_preview}...\n"
            
            reflect_prompt = f"<|im_start|>user\nPlease reflect on the current state of this document generation job. What insights have we gained? What areas need more exploration? What are the key conclusions so far?\n{conversation_summary}<|im_end|>"
            llm_response = send_to_dolphin_llm(reflect_prompt, job.get("conversation", []))
            
            # Add to conversation
            if "conversation" not in job:
                job["conversation"] = []
                
            job["conversation"].append({
                "role": "system",
                "content": "Self-reflection request",
                "timestamp": int(time.time())
            })
            
            job["conversation"].append({
                "role": "assistant",
                "content": llm_response,
                "timestamp": int(time.time())
            })
        
        # Update job in user data
        job["last_modified"] = int(time.time())
        user_data["jobs"][job_index] = job
        
        # Save updated user data
        save_user_data(user_id, user_data)
        
        # Set response
        response["status"] = "success"
        response["message"] = f"Data processed with type: {processing_type}"
        response["data"] = {
            "job": job,
            "assistant_response": llm_response
        }
        
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to process data: {str(e)}"
        return response