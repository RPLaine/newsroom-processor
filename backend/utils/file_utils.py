"""
File utility functions for handling file operations
"""
import os
import json
import time
from pathlib import Path

def ensure_directory(directory_path):
    """
    Ensure a directory exists, creating it if necessary
    
    Args:
        directory_path: Path to directory to ensure exists
        
    Returns:
        True if directory exists or was created, False otherwise
    """
    try:
        Path(directory_path).mkdir(parents=True, exist_ok=True)
        return True
    except Exception as e:
        print(f"Error creating directory {directory_path}: {e}")
        return False

def load_data(file_path, default=None):
    """
    Load JSON data from a file
    
    Args:
        file_path: Path to JSON file
        default: Default value to return if file doesn't exist or has errors
        
    Returns:
        Loaded data or default value
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {} if default is None else default
    except Exception as e:
        print(f"Error loading file {file_path}: {e}")
        return {} if default is None else default

def save_data(file_path, data):
    """
    Save data to a JSON file
    
    Args:
        file_path: Path to save file
        data: Data to save
        
    Returns:
        True if save was successful, False otherwise
    """
    try:
        # Ensure directory exists
        directory = os.path.dirname(file_path)
        if directory:
            ensure_directory(directory)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving file {file_path}: {e}")
        return False