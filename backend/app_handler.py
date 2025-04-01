"""
Application handler module for routing actions to appropriate handlers
"""
from backend.handlers.handler_factory import HandlerFactory

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
    # Extract action and user ID from response
    action = response.get("request", {}).get("action")
    user_id = response.get("userid")
    request_data = response.get("request", {})
    
    if not action:
        response["status"] = "error"
        response["message"] = "Missing action in request"
        return response
    
    # Special case for application_init which just returns the response as-is
    if action == "application_init":
        response["status"] = "success"
        return response
    
    # Get the appropriate handler for this action
    handler = HandlerFactory.get_handler(action, user_id)
    
    if handler:
        # Use the handler to process the request
        return handler.handle(response, request_data)
    else:
        # No handler found for this action
        response["status"] = "error"
        response["message"] = f"Unknown application action: {action}"
        return response