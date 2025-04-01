import json
import os
import portalocker

def read_json_file(path):
    """
    Read a JSON file from the specified path.
    
    Args:
        path: Path to the JSON file
        
    Returns:
        JSON data if successful, False if file doesn't exist, empty dict on error
    """
    if not os.path.exists(path):
        return False
        
    try:
        with portalocker.Lock(path, 'r', timeout=10) as file:
            return json.load(file)
    except (json.JSONDecodeError, IOError, portalocker.LockException) as e:
        print(f"Error reading {path}: {str(e)}")
        return {}

def write_json_file(path, data, indent: int = 2):
    """
    Write data to a JSON file at the specified path.
    
    Args:
        path: Path to the JSON file
        data: The data to write to the file
        indent: Number of spaces for indentation (default: 2)
        
    Returns:
        True if successful, False on error
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    try:
        with portalocker.Lock(path, 'w', timeout=10) as file:
            json.dump(data, file, indent=indent)
        return True
    except (IOError, portalocker.LockException) as e:
        print(f"Error writing to {path}: {str(e)}")
        return False
    
def is_user_id_valid(user_id, user_data_path):
    """
    Check if the user ID is valid by comparing it with the user data file.
    
    Args:
        user_id: The user ID to validate
        user_data_path: Path to the user data file
        
    Returns:
        True if valid, False otherwise
    """
    user_data = read_json_file(user_data_path)
    if user_data is False:  # File doesn't exist
        # Create an empty user data file
        write_json_file(user_data_path, {})
        return False
    return user_id in user_data