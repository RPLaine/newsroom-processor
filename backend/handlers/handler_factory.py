"""
Handler factory module for creating and routing to the appropriate request handlers
"""

class HandlerFactory:
    """Factory class to create appropriate handlers based on action"""
    
    @staticmethod
    def get_handler(action, user_id=None):
        """
        Get appropriate handler for the given action
        
        Args:
            action: Action string from request
            user_id: User ID
            
        Returns:
            Handler instance or None if not found
        """
        # Import handlers here to avoid circular imports
        from backend.handlers.job_handlers import (
            CreateJobHandler, 
            ContinueJobHandler,
            GetJobsHandler,
            DeleteJobHandler
        )
        from backend.handlers.input_handlers import (
            WebSearchHandler,
            RSSHandler,
            FileHandler
        )
        from backend.handlers.process_handlers import (
            ProcessDataHandler,
            SaveOutputHandler
        )
        
        # Map actions to handler classes
        handlers = {
            # Job handlers
            "create_job": CreateJobHandler(user_id),
            "continue_job": ContinueJobHandler(user_id),
            "get_jobs": GetJobsHandler(user_id),
            "delete_job": DeleteJobHandler(user_id),
            
            # Input handlers
            "search_web": WebSearchHandler(user_id),
            "read_rss": RSSHandler(user_id),
            "load_file": FileHandler(user_id),
            
            # Process handlers
            "process_data": ProcessDataHandler(user_id),
            "save_output": SaveOutputHandler(user_id)
        }
        
        return handlers.get(action)