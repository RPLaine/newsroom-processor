"""
Base handler module providing common functionality for all request handlers
"""
from backend.utils.response_utils import create_error_response

class BaseHandler:
    """Base class for request handlers"""
    
    def __init__(self, user_id=None):
        """
        Initialize the handler
        
        Args:
            user_id: ID of the current user
        """
        self.user_id = user_id
    
    def validate_request(self, request_data):
        """
        Validate incoming request data
        
        Args:
            request_data: Request data to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Default implementation passes validation
        # Subclasses should override this method
        return True, None
    
    def process(self, response, request_data):
        """
        Process the request and update the response
        
        Args:
            response: Response dictionary to update
            request_data: Request data to process
            
        Returns:
            Updated response dictionary
        """
        # Implement in subclasses
        raise NotImplementedError("Subclasses must implement process method")
    
    def handle(self, response, request_data):
        """
        Handle the request - validates and processes
        
        Args:
            response: Response dictionary to update
            request_data: Request data to process
            
        Returns:
            Updated response dictionary
        """
        valid, error = self.validate_request(request_data)
        if not valid:
            response.update(create_error_response(error))
            return response
            
        return self.process(response, request_data)