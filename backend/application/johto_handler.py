import backend.file_handler as file_handler
import requests
import os
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

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
            # Process the root directory and all subdirectories recursively
            process_directory(johto_url, johto_dir)
            
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

def process_directory(url: str, local_dir: str):
    """
    Process a directory from johto.online, downloading all JSON files
    and recursively processing subdirectories
    
    Args:
        url: The URL of the directory to process
        local_dir: The local directory to save files to
    """
    print(f"Processing directory: {url}")
    # Make sure the URL ends with a slash
    if not url.endswith('/'):
        url += '/'
    
    # Make sure the local directory exists
    file_handler.ensure_directory(local_dir)
    
    # Get the directory listing
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Failed to access {url}: HTTP {response.status_code}")
        return
    
    # Save the index file
    index_path = os.path.join(local_dir, "index.html")
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(response.text)
    
    # Try to parse as JSON to check if it's a directory listing
    try:
        data = json.loads(response.text)
        if isinstance(data, list):
            # It's a JSON array, likely a file listing
            for item in data:
                if isinstance(item, str):
                    # Check if it's a directory (ends with /)
                    if item.endswith('/'):
                        sub_url = urljoin(url, item)
                        sub_dir = os.path.join(local_dir, item.rstrip('/'))
                        process_directory(sub_url, sub_dir)
                    # Check if it's a JSON file
                    elif item.endswith('.json'):
                        download_file(urljoin(url, item), os.path.join(local_dir, item))
    except json.JSONDecodeError:
        # Not JSON, might be HTML - let's try to extract links
        links = re.findall(r'href=[\'"]?([^\'" >]+)', response.text)
        
        for link in links:
            # Skip parent directory links
            if link == "../" or link == "./" or link == "/":
                continue
                
            # Check if it's a directory (ends with /)
            if link.endswith('/'):
                sub_url = urljoin(url, link)
                sub_dir = os.path.join(local_dir, link.rstrip('/'))
                process_directory(sub_url, sub_dir)
            # Check if it's a JSON file
            elif link.endswith('.json'):
                download_file(urljoin(url, link), os.path.join(local_dir, link))
    
    # Also try to download common data files directly
    common_files = ['data.json', 'metadata.json', 'config.json', 'info.json']
    for filename in common_files:
        file_url = urljoin(url, filename)
        file_path = os.path.join(local_dir, filename)
        download_file(file_url, file_path)

def download_file(url: str, local_path: str):
    """
    Download a single file from a URL to a local path
    
    Args:
        url: The URL of the file to download
        local_path: The local path to save the file to
    """
    try:
        print(f"Downloading {url} to {local_path}")
        response = requests.get(url)
        
        if response.status_code == 200:
            # Make sure the directory exists
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            # Save the file
            with open(local_path, 'w', encoding='utf-8') as f:
                f.write(response.text)
            print(f"Downloaded {url}")
        else:
            print(f"Failed to download {url}: HTTP {response.status_code}")
    except Exception as e:
        print(f"Error downloading {url}: {str(e)}")