import os
import time
from backend.file_handler import load_user_data, save_user_data, load_data

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