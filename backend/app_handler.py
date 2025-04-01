"""
Application Handler

This module serves as a router for application-related actions.
It processes JSON requests based on the 'action' key and
forwards them to the appropriate handler in the application package.
"""

from backend.application import route_app_actions

def handle_app_actions(response, cookie, config):
    """
    Route application actions to the appropriate handler
    
    The server exclusively uses JSON data in the request body and
    routes actions based on the 'action' key in the request JSON.
    URL paths are not used for routing different actions.
    
    Args:
        response: Response object containing request data with the 'action' key
        cookie: Cookie object for session management
        config: Server configuration
        
    Returns:
        Updated response object
    """
    # All application actions are processed based on the 'action' key in the JSON request
    if 'request' in response and 'action' in response['request']:
        return route_app_actions(response, cookie, config)
    else:
        response["status"] = "error"
        response["message"] = "Missing action in request"
        return response