"""
Utility modules for the backend
Provides common functionality for response formatting, file operations, and HTTP requests
"""

# Import common utility functions to make them available from the utils package
from backend.utils.response_utils import create_success_response, create_error_response
from backend.utils.file_utils import load_data, save_data, ensure_directory