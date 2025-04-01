import os
import json
import time
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

def create_user_data_directory(user_id, username, email):
    user_dir = os.path.join("data", "users", user_id)
    os.makedirs(user_dir, exist_ok=True)
    
    jobs_dir = os.path.join(user_dir, "jobs")
    os.makedirs(jobs_dir, exist_ok=True)
    
    user_data = {
        "id": user_id,
        "username": username,
        "email": email,
        "created_at": int(time.time()),
        "last_login": int(time.time()),
        "jobs": [],
        "settings": {
            "theme": "dark",
            "language": "en"
        }
    }
    
    return save_user_data(user_id, user_data)

def update_last_login(user_id):
    user_data = load_user_data(user_id)
    user_data["last_login"] = int(time.time())
    return save_user_data(user_id, user_data)

def get_user_settings(user_id):
    user_data = load_user_data(user_id)
    return user_data.get("settings", {})

def update_user_settings(user_id, settings):
    user_data = load_user_data(user_id)
    user_data["settings"] = settings
    return save_user_data(user_id, user_data)

def get_user_stories(user_id):
    user_data = load_user_data(user_id)
    return user_data.get("stories", [])

def get_user_session_data(user_id, user_data_path):
    update_last_login(user_id)
    
    users = load_data(user_data_path)
    user_info = users.get(user_id, {})
    
    user_settings = get_user_settings(user_id)
    
    return {
        "id": user_id,
        "username": user_info.get("username", ""),
        "email": user_info.get("email", ""),
        "settings": user_settings
    }