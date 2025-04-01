import json
import os
import portalocker

def read_json_file(path: str, timeout: int = 10) -> dict:
    if not os.path.exists(path):
        return {}
    try:
        with portalocker.Lock(path, 'r', timeout) as file:
            return json.load(file)
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error reading JSON file at {path}: {e}")
        return {}

def write_json_file(path: str, data: dict, indent: int = 2, timeout: int = 10) -> bool:
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with portalocker.Lock(path, 'w', timeout) as file:
            json.dump(data, file, indent=indent)
        return True
    except (IOError, OSError) as e:
        print(f"Error writing JSON file at {path}: {e}")
        return False
    
def is_user_id_valid(user_id: str, user_data_path: str) -> bool:
    user_data = read_json_file(user_data_path)
    if user_data is None:
        write_json_file(user_data_path, {})
        return False
    return user_id in user_data

def load_user_data(user_id: str, base_path: str = "data/users") -> dict:
    ensure_directory_exists(base_path)
    user_data_path = os.path.join(base_path, user_id, "data.json")
    return read_json_file(user_data_path) or {}

def save_user_data(user_id: str, user_data: dict, base_path: str = "data/users") -> bool:
    ensure_directory_exists(base_path)
    user_data_path = os.path.join(base_path, user_id, "data.json")
    return write_json_file(user_data_path, user_data)

def ensure_directory_exists(path: str) -> bool:
    try:
        if not os.path.exists(path):
            os.makedirs(path, exist_ok=True)
        return True
    except OSError as e:
        print(f"Error creating directory at {path}: {e}")
        return False