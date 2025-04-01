"""
HTTP utility functions for making requests and handling responses
"""
import requests
import json

def make_get_request(url, params=None, headers=None, timeout=10):
    """
    Make a GET request to a URL
    
    Args:
        url: URL to request
        params: Query parameters
        headers: Request headers
        timeout: Request timeout in seconds
        
    Returns:
        Response object or None on error
    """
    try:
        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=timeout
        )
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        print(f"Error making GET request to {url}: {e}")
        return None

def make_post_request(url, data=None, json_data=None, headers=None, timeout=10):
    """
    Make a POST request to a URL
    
    Args:
        url: URL to request
        data: Form data
        json_data: JSON data
        headers: Request headers
        timeout: Request timeout in seconds
        
    Returns:
        Response object or None on error
    """
    try:
        response = requests.post(
            url,
            data=data,
            json=json_data,
            headers=headers,
            timeout=timeout
        )
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        print(f"Error making POST request to {url}: {e}")
        return None