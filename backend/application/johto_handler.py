import backend.file_handler as file_handler
import requests
import os
import json
import re
from pathlib import Path

def handle_load_johto_data(response: dict) -> dict:
    """
    Handle the 'load_johto_data' action - download data from johto.online to data/johto
    """
    try:
        # Ensure the johto directory exists
        johto_dir = os.path.join("data", "johto")
        file_handler.ensure_directory(johto_dir)

        # URL to download data from
        johto_url = "https://www.johto.online/data/"
        
        try:
            # First, attempt to get the directory listing or index file
            index_response = requests.get(johto_url)
            
            if index_response.status_code != 200:
                response['status'] = 'error'
                response['message'] = f'Failed to access Johto data: HTTP {index_response.status_code}'
                return response
            
            # Save the initial index response
            with open(os.path.join(johto_dir, "index.html"), 'w', encoding='utf-8') as f:
                f.write(index_response.text)
            
            # Try to parse as JSON to check if it's a directory listing
            try:
                data = json.loads(index_response.text)
                if isinstance(data, list):
                    # It's a JSON array, likely a file listing
                    for item in data:
                        if isinstance(item, str) and (item.endswith('.json') or item.endswith('.csv')):
                            file_url = f"{johto_url.rstrip('/')}/{item}"
                            file_response = requests.get(file_url)
                            
                            if file_response.status_code == 200:
                                with open(os.path.join(johto_dir, item), 'w', encoding='utf-8') as f:
                                    f.write(file_response.text)
            except json.JSONDecodeError:
                # Not JSON, might be HTML - let's try to extract links
                
                # Simple regex to find href links
                links = re.findall(r'href=[\'"]?([^\'" >]+)', index_response.text)
                
                for link in links:
                    if link.endswith('.json') or link.endswith('.csv'):
                        file_url = f"{johto_url.rstrip('/')}/{link}"
                        file_response = requests.get(file_url)
                        
                        if file_response.status_code == 200:
                            with open(os.path.join(johto_dir, link), 'w', encoding='utf-8') as f:
                                f.write(file_response.text)
            
            # Also try to download common data files directly
            common_files = ['data.json', 'metadata.json', 'config.json', 'info.json']
            for filename in common_files:
                file_url = f"{johto_url.rstrip('/')}/{filename}"
                file_response = requests.get(file_url)
                
                if file_response.status_code == 200:
                    with open(os.path.join(johto_dir, filename), 'w', encoding='utf-8') as f:
                        f.write(file_response.text)
            
        except Exception as fetch_error:
            response['status'] = 'error'
            response['message'] = f'Error fetching files from Johto: {str(fetch_error)}'
            return response
        
        response['status'] = 'success'
        response['message'] = 'Johto data downloaded successfully'
        return response
        
    except Exception as e:
        response['status'] = 'error'
        response['message'] = f'Error downloading Johto data: {str(e)}'
        return response