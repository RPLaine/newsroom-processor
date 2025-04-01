"""
Response utility functions for standardizing API responses
"""

def create_success_response(data=None, message="Operation successful"):
    """
    Create a standardized success response
    
    Args:
        data: Optional data to include in the response
        message: Success message
        
    Returns:
        Dictionary with standardized success response format
    """
    response = {
        "status": "success",
        "message": message
    }
    
    if data is not None:
        response["data"] = data
        
    return response

def create_error_response(message="An error occurred", error_code=None):
    """
    Create a standardized error response
    
    Args:
        message: Error message
        error_code: Optional error code
        
    Returns:
        Dictionary with standardized error response format
    """
    response = {
        "status": "error",
        "message": message
    }
    
    if error_code is not None:
        response["error_code"] = error_code
        
    return response