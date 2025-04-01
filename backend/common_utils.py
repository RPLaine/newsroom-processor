"""
Common utilities for database and file operations.
This module avoids circular imports by providing a central place for shared functions.
"""
import os
import json

def get_user_data_file_path(user_id):
    """
    Get the path to a user's data.json file
    
    Args:
        user_id: The user ID
        
    Returns:
        Path to the user's data.json file
    """
    return os.path.join("data", "users", user_id, "data.json")

def read_json_file(file_path):
    """
    Read a JSON file and return its contents
    
    Args:
        file_path: Path to the JSON file
        
    Returns:
        Dictionary or list with file contents, or None if file doesn't exist or is invalid
    """
    try:
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, 'r') as file:
            return json.load(file)
    except Exception:
        return None

def write_json_file(file_path, data):
    """
    Write data to a JSON file
    
    Args:
        file_path: Path to the JSON file
        data: Data to write to the file
        
    Returns:
        True if successful, False on error
    """
    try:
        # Ensure directory exists
        directory = os.path.dirname(file_path)
        os.makedirs(directory, exist_ok=True)
        
        with open(file_path, 'w') as file:
            json.dump(data, file, indent=4)
        return True
    except Exception:
        return False

def load_user_data(user_id):
    """
    Load a user's data from their data.json file
    
    Args:
        user_id: The user ID
        
    Returns:
        User data dictionary or empty dict if not found
    """
    user_data_path = get_user_data_file_path(user_id)
    return read_json_file(user_data_path) or {}

def save_user_data(user_id, user_data):
    """
    Save a user's data to their data.json file
    
    Args:
        user_id: The user ID
        user_data: The user data to save
        
    Returns:
        True if successful, False on error
    """
    user_data_path = get_user_data_file_path(user_id)
    return write_json_file(user_data_path, user_data)