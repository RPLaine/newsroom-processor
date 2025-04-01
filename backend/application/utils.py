"""
Utility functions for the application
"""
import json
import requests

def send_to_dolphin_llm(message, system_message="", model="dolphin-mixtral:latest"):
    """
    Send a message to the Dolphin LLM API
    
    Args:
        message: The user message to send
        system_message: Optional system message for context
        model: The model to use for inference
        
    Returns:
        The response from the LLM
    """
    # Implementation for LLM API calls
    try:
        # Add actual API call implementation here
        response = {"response": "LLM response would go here"}
        return response
    except Exception as e:
        return {"error": str(e)}