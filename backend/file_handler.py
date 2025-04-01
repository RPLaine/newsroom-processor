import os
import json
from pathlib import Path

# File operations
def ensure_directory(directory_path):
    Path(directory_path).mkdir(parents=True, exist_ok=True)
    return True

def load_data(file_path, default=None):
    if not os.path.exists(file_path):
        return default
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(file_path, data):
    directory = os.path.dirname(file_path)
    if directory:
        ensure_directory(directory)
            
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    return True

# User data operations
def get_user_data_file_path(user_id, base_path="data/users"):
    return os.path.join(base_path, user_id, "data.json")

def load_user_data(user_id, base_path="data/users"):
    user_dir = os.path.join(base_path, user_id)
    ensure_directory(user_dir)
    
    user_data_path = os.path.join(user_dir, "data.json")
    return load_data(user_data_path, default={})

def save_user_data(user_id, user_data, base_path="data/users"):
    user_dir = os.path.join(base_path, user_id)
    ensure_directory(user_dir)
    
    user_data_path = os.path.join(user_dir, "data.json")
    return save_data(user_data_path, user_data)

def is_user_id_valid(user_id, user_data_path):
    """Check if a user ID exists in the users database."""
    users = load_data(user_data_path, default={})
    return user_id in users