import os
import time
import backend.database_handler as database_handler

def get_user_data_file_path(user_id):
    """
    Get the path to a user's data.json file
    
    Args:
        user_id: The user ID
        
    Returns:
        Path to the user's data.json file
    """
    return os.path.join("data", "users", user_id, "data.json")

def load_user_data(user_id):
    """
    Load a user's data from their data.json file
    
    Args:
        user_id: The user ID
        
    Returns:
        User data dictionary or empty dict if not found
    """
    user_data_path = get_user_data_file_path(user_id)
    return database_handler.read_json_file(user_data_path) or {}

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
    return database_handler.write_json_file(user_data_path, user_data)

def create_user_data_directory(user_id, username, email):
    """
    Create a user's data directory and initial data.json file
    
    Args:
        user_id: The user ID
        username: The username
        email: The user's email
        
    Returns:
        True if successful, False on error
    """
    # Create user directory using userid as folder name
    user_dir_path = os.path.join("data", "users", user_id)
    os.makedirs(user_dir_path, exist_ok=True)
    
    # Create initial data.json for the user
    user_data_json_path = os.path.join(user_dir_path, "data.json")
    initial_user_data = {
        "profile": {
            "username": username,
            "email": email,
            "created_at": int(time.time()),
            "last_login": int(time.time())
        },
        "settings": {
            "theme": "default",
            "notifications": True
        },
        "stories": []
    }
    
    # Save user data.json
    return database_handler.write_json_file(user_data_json_path, initial_user_data)

def update_last_login(user_id):
    """
    Update the last_login timestamp for a user
    
    Args:
        user_id: The user ID
        
    Returns:
        True if successful, False on error
    """
    user_data = load_user_data(user_id)
    if "profile" in user_data:
        user_data["profile"]["last_login"] = int(time.time())
        return save_user_data(user_id, user_data)
    return False

def get_user_settings(user_id):
    """
    Get a user's settings
    
    Args:
        user_id: The user ID
        
    Returns:
        User settings dictionary or empty dict if not found
    """
    user_data = load_user_data(user_id)
    return user_data.get("settings", {})

def update_user_settings(user_id, settings):
    """
    Update a user's settings
    
    Args:
        user_id: The user ID
        settings: The new settings dictionary
        
    Returns:
        True if successful, False on error
    """
    user_data = load_user_data(user_id)
    user_data["settings"] = settings
    return save_user_data(user_id, user_data)

def get_user_stories(user_id):
    """
    Get a user's stories
    
    Args:
        user_id: The user ID
        
    Returns:
        List of user stories or empty list if not found
    """
    user_data = load_user_data(user_id)
    return user_data.get("stories", [])

def get_user_session_data(user_id, user_data_path):
    """
    Get user session data including their profile and settings
    
    Args:
        user_id: The user ID
        user_data_path: Path to the main users data file
        
    Returns:
        Dictionary with user session data including profile and settings
    """
    # Update the last login timestamp
    update_last_login(user_id)
    
    # Get user info from main database
    users = database_handler.read_json_file(user_data_path)
    user_info = users.get(user_id, {})
    
    # Get user settings from user's data.json
    user_settings = get_user_settings(user_id)
    
    # Return formatted user data
    return {
        "id": user_id,
        "username": user_info.get("username", ""),
        "email": user_info.get("email", ""),
        "settings": user_settings
    }

def get_user_data(user_id):
    """
    Get the complete user data from their data.json file
    
    Args:
        user_id: The user ID
        
    Returns:
        Complete user data dictionary or empty dict if not found
    """
    return load_user_data(user_id)