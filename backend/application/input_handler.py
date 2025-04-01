"""
Input Handler Module

This module handles various types of inputs for document generation jobs, 
including web searches, RSS feeds, and file loading.
"""

import json
import os
import time
from .utils import get_user_data_path, save_user_data

def handle_search_web(response, user_id, request_data):
    """
    Handle web search request
    
    Args:
        response: The response dictionary
        user_id: The user ID
        request_data: The request data containing search query
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Extract search data
        query = request_data.get("query", "")
        job_id = request_data.get("job_id")
        
        if not query:
            response["status"] = "error"
            response["message"] = "Search query is required"
            return response
            
        if not job_id:
            response["status"] = "error"
            response["message"] = "Job ID is required"
            return response
            
        # In a real implementation, this would connect to a search API
        # This is a simplified mock implementation
        search_results = [
            {
                "title": f"Search result for '{query}'",
                "url": f"https://example.com/search?q={query.replace(' ', '+')}",
                "snippet": f"This is a sample search result for the query '{query}'. In a real implementation, this would contain actual search results from a search engine API."
            }
        ]
        
        # Add to job inputs
        user_data_path = get_user_data_path(user_id)
        
        if os.path.exists(user_data_path):
            with open(user_data_path, 'r') as f:
                user_data = json.load(f)
                
            for i, job in enumerate(user_data.get("jobs", [])):
                if job["id"] == job_id:
                    if "inputs" not in job:
                        job["inputs"] = []
                        
                    job["inputs"].append({
                        "type": "web_search",
                        "query": query,
                        "results": search_results,
                        "timestamp": int(time.time())
                    })
                    
                    job["last_modified"] = int(time.time())
                    user_data["jobs"][i] = job
                    
                    # Save updated user data
                    save_user_data(user_id, user_data)
                    
                    response["status"] = "success"
                    response["message"] = "Web search completed"
                    response["data"] = {
                        "results": search_results,
                        "job": job
                    }
                    
                    return response
                    
            response["status"] = "error"
            response["message"] = "Job not found"
        else:
            response["status"] = "error"
            response["message"] = "User data not found"
            
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to search web: {str(e)}"
        return response

def handle_read_rss(response, user_id, request_data):
    """
    Handle RSS feed reading request
    
    Args:
        response: The response dictionary
        user_id: The user ID
        request_data: The request data containing RSS URL
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Extract RSS data
        rss_url = request_data.get("rss_url", "")
        job_id = request_data.get("job_id")
        
        if not rss_url:
            response["status"] = "error"
            response["message"] = "RSS URL is required"
            return response
            
        if not job_id:
            response["status"] = "error"
            response["message"] = "Job ID is required"
            return response
            
        # In a real implementation, this would fetch and parse RSS feeds
        # This is a simplified mock implementation
        rss_items = [
            {
                "title": "Sample RSS item",
                "link": rss_url,
                "description": f"This is a sample RSS item from {rss_url}. In a real implementation, this would contain actual items from the RSS feed.",
                "published": time.strftime("%a, %d %b %Y %H:%M:%S +0000", time.gmtime())
            }
        ]
        
        # Add to job inputs
        user_data_path = get_user_data_path(user_id)
        
        if os.path.exists(user_data_path):
            with open(user_data_path, 'r') as f:
                user_data = json.load(f)
                
            for i, job in enumerate(user_data.get("jobs", [])):
                if job["id"] == job_id:
                    if "inputs" not in job:
                        job["inputs"] = []
                        
                    job["inputs"].append({
                        "type": "rss_feed",
                        "url": rss_url,
                        "items": rss_items,
                        "timestamp": int(time.time())
                    })
                    
                    job["last_modified"] = int(time.time())
                    user_data["jobs"][i] = job
                    
                    # Save updated user data
                    save_user_data(user_id, user_data)
                    
                    response["status"] = "success"
                    response["message"] = "RSS feed read successfully"
                    response["data"] = {
                        "items": rss_items,
                        "job": job
                    }
                    
                    return response
                    
            response["status"] = "error"
            response["message"] = "Job not found"
        else:
            response["status"] = "error"
            response["message"] = "User data not found"
            
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to read RSS feed: {str(e)}"
        return response

def handle_load_file(response, user_id, request_data):
    """
    Handle file loading request
    
    Args:
        response: The response dictionary
        user_id: The user ID
        request_data: The request data containing file content
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Extract file data
        file_name = request_data.get("file_name", "")
        file_content = request_data.get("file_content", "")
        job_id = request_data.get("job_id")
        
        if not file_name:
            response["status"] = "error"
            response["message"] = "File name is required"
            return response
            
        if not file_content:
            response["status"] = "error"
            response["message"] = "File content is required"
            return response
            
        if not job_id:
            response["status"] = "error"
            response["message"] = "Job ID is required"
            return response
            
        # Add to job inputs
        user_data_path = get_user_data_path(user_id)
        
        if os.path.exists(user_data_path):
            with open(user_data_path, 'r') as f:
                user_data = json.load(f)
                
            for i, job in enumerate(user_data.get("jobs", [])):
                if job["id"] == job_id:
                    if "inputs" not in job:
                        job["inputs"] = []
                        
                    job["inputs"].append({
                        "type": "file",
                        "name": file_name,
                        "content": file_content,
                        "timestamp": int(time.time())
                    })
                    
                    job["last_modified"] = int(time.time())
                    user_data["jobs"][i] = job
                    
                    # Save updated user data
                    save_user_data(user_id, user_data)
                    
                    response["status"] = "success"
                    response["message"] = "File loaded successfully"
                    response["data"] = {
                        "file_name": file_name,
                        "job": job
                    }
                    
                    return response
                    
            response["status"] = "error"
            response["message"] = "Job not found"
        else:
            response["status"] = "error"
            response["message"] = "User data not found"
            
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to load file: {str(e)}"
        return response