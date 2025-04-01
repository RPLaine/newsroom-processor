import backend.file_handler as file_handler
import requests
import os
import json
import re
from urllib.parse import urljoin, urlparse

def handle_load_johto_data(response: dict) -> dict:
    try:
        johto_dir = os.path.join("data", "johto")
        file_handler.ensure_directory(johto_dir)

        johto_url = "https://www.johto.online/data/"
        
        try:
            process_directory(johto_url, johto_dir)
            
        except Exception as fetch_error:
            response['status'] = 'error'
            response['message'] = f'Error fetching files from Johto: {str(fetch_error)}'
            return response
        
        try:
            structures_data = collect_structures()
            
            file_handler.ensure_directory("data")
            
            structures_path = os.path.join("data", "structures.json")
            with open(structures_path, 'w', encoding='utf-8') as f:
                json.dump(structures_data, f, indent=4)
                
            print(f"Saved structures data to {structures_path}")
            
            response['data'] = {
                'structures': structures_data
            }
            
            response['status'] = 'success'
            response['message'] = 'Johto data downloaded and processed successfully'
        except Exception as process_error:
            response['status'] = 'error'
            response['message'] = f'Error processing Johto data: {str(process_error)}'
            return response
            
        return response
        
    except Exception as e:
        response['status'] = 'error'
        response['message'] = f'Error downloading Johto data: {str(e)}'
        return response

def process_directory(url: str, local_dir: str):
    print(f"Processing directory: {url}")
    if not url.endswith('/'):
        url += '/'
    
    file_handler.ensure_directory(local_dir)
    
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Failed to access {url}: HTTP {response.status_code}")
        return
    
    try:
        data = json.loads(response.text)
        if isinstance(data, list):
            for item in data:
                if isinstance(item, str):
                    if item.endswith('/'):
                        sub_url = urljoin(url, item)
                        sub_dir = os.path.join(local_dir, item.rstrip('/'))
                        process_directory(sub_url, sub_dir)
                    elif item.endswith('.json'):
                        download_file(urljoin(url, item), os.path.join(local_dir, item))
    except json.JSONDecodeError:
        links = re.findall(r'href=[\'"]?([^\'" >]+)', response.text)
        
        for link in links:
            if link == "../" or link == "./" or link == "/":
                continue
                
            if link.endswith('/'):
                sub_url = urljoin(url, link)
                sub_dir = os.path.join(local_dir, link.rstrip('/'))
                process_directory(sub_url, sub_dir)
            elif link.endswith('.json'):
                download_file(urljoin(url, link), os.path.join(local_dir, link))
    
    common_files = ['data.json', 'metadata.json', 'config.json', 'info.json']
    for filename in common_files:
        file_url = urljoin(url, filename)
        file_path = os.path.join(local_dir, filename)
        download_file(file_url, file_path)

def download_file(url: str, local_path: str):
    try:
        if not url.endswith('.json'):
            return
            
        print(f"Downloading {url} to {local_path}")
        response = requests.get(url)
        
        if response.status_code == 200:
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            with open(local_path, 'w', encoding='utf-8') as f:
                f.write(response.text)
            print(f"Downloaded {url}")
        else:
            print(f"Failed to download {url}: HTTP {response.status_code}")
    except Exception as e:
        print(f"Error downloading {url}: {str(e)}")

def collect_structures() -> dict:
    result = {}
    johto_dir = os.path.join("data", "johto")
    users_file_path = os.path.join(johto_dir, "users.json")
    
    try:
        with open(users_file_path, 'r', encoding='utf-8') as f:
            users_data = json.load(f)
            
        for user in users_data.get('users', []):
            user_id = user.get('id')
            username = user.get('username')
            
            if user_id and username:
                user_dir = os.path.join(johto_dir, "users", user_id)
                structures_file = os.path.join(user_dir, "saved_structures.json")
                
                if os.path.exists(structures_file):
                    try:
                        with open(structures_file, 'r', encoding='utf-8') as f:
                            structures_data = json.load(f)
                            # Only get the "structures" key from the saved_structures.json file
                            user_structures = structures_data.get("structures", {})
                    except json.JSONDecodeError as e:
                        print(f"Error decoding JSON from {structures_file}: {str(e)}")
                        user_structures = {}
                else:
                    user_structures = {}
                
                result[user_id] = {
                    'username': username,
                    'structures': user_structures
                }
    
    except Exception as e:
        print(f"Error loading users from {users_file_path}: {str(e)}")
    
    return result
