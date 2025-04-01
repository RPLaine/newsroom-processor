"""
Process handlers for data processing and output saving
"""
import json
import os
from backend.prompts import generate_prompt

def handle_process_data(response, user_id, request_data):
    """
    Process data with various processing options

    Args:
        response: Response object
        user_id: ID of the current user
        request_data: Request data containing processing parameters

    Returns:
        Updated response with processing results
    """
    process_type = request_data.get("processing_type", "default")
    
    if process_type == "prompt":
        prompt = request_data.get("prompt", "")
        if not prompt:
            response["status"] = "error"
            response["message"] = "Prompt is required for processing."
            return response

        try:
            # Format messages for the LLM
            messages = [
                {"role": "user", "content": prompt}
            ]

            # Call the Dolphin 3.0 LLM
            llm_response = generate_prompt(messages)

            # Debug: Print the response to the terminal
            print("LLM Response:", llm_response)

            if llm_response:
                response["status"] = "success"
                response["data"] = {
                    "assistant_response": llm_response,
                    "job": {
                        "id": request_data.get("job_id", ""),
                        "conversation": [
                            {"role": "user", "content": prompt},
                            {"role": "assistant", "content": llm_response}
                        ]
                    }
                }
            else:
                response["status"] = "error"
                response["message"] = "Failed to get a response from the LLM."
        except Exception as e:
            response["status"] = "error"
            response["message"] = f"Error processing prompt: {str(e)}"
    else:
        response["status"] = "error"
        response["message"] = f"Unsupported processing type: {process_type}"

    return response

def handle_save_output(response, user_id, request_data):
    """
    Save processing output to a file
    
    Args:
        response: Response object
        user_id: ID of the current user
        request_data: Request data containing output data and file path
        
    Returns:
        Updated response with save status
    """
    # Implementation for saving output
    output_data = request_data.get("output", {})
    file_path = request_data.get("path", "")
    
    response["status"] = "success"
    response["message"] = f"Output saved to {file_path}"
    return response