"""
Application Handler

This module serves as a thin wrapper around the application package modules,
providing backward compatibility with the existing codebase.
"""

from backend.application import route_app_actions

def handle_app_actions(response, cookie, config):
    """
    Route application actions to the appropriate handler
    
    Args:
        response: Response object containing request data
        cookie: Cookie object for session management
        config: Server configuration
        
    Returns:
        Updated response object
    """
    return route_app_actions(response, cookie, config)