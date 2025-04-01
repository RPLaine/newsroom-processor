"""
Process handlers for LLM operations and output management
"""
from backend.handlers.base_handler import BaseHandler
from backend.utils.response_utils import create_success_response, create_error_response
from backend.utils.file_utils import load_data, save_data
from backend.ai import generate_prompt

class ProcessDataHandler(BaseHandler):
    """Handler for processing data with LLM"""
    
    def validate_request(self, request_data):
        """Validate process data request"""
        if not request_data.get("processing_type"):
            return False, "Processing type is required"
        if not request_data.get("job_id"):
            return False, "Job ID is required"
            
        processing_type = request_data.get("processing_type")
        if processing_type == "prompt" and not request_data.get("prompt"):
            return False, "Prompt is required for prompt processing"
            
        return True, None
    
    def process(self, response, request_data):
        """Process data with LLM"""
        if not self.user_id:
            return create_error_response("User ID is required")
            
        job_id = request_data.get("job_id")
        processing_type = request_data.get("processing_type")
        
        # Load job data
        job_path = f"data/users/{self.user_id}/jobs/{job_id}/data.json"
        job_data = load_data(job_path)
        
        if not job_data:
            return create_error_response("Job not found")
            
        # Process based on processing type
        if processing_type == "prompt":
            return self._process_prompt(job_data, request_data)
        elif processing_type == "refine":
            return self._process_refine(job_data)
        elif processing_type == "reflect":
            return self._process_reflect(job_data)
        else:
            return create_error_response(f"Unsupported processing type: {processing_type}")
    
    def _process_prompt(self, job_data, request_data):
        """Process user prompt with LLM"""
        prompt = request_data.get("prompt")
        job_id = request_data.get("job_id")
        
        try:
            # Format messages for the LLM
            messages = [
                {"role": "user", "content": prompt}
            ]
            
            # Call the LLM
            llm_response = generate_prompt(messages)
            
            if not llm_response:
                return create_error_response("Failed to get a response from the LLM")
                
            # Update job conversation
            if "conversation" not in job_data:
                job_data["conversation"] = []
                
            job_data["conversation"].extend([
                {"role": "user", "content": prompt},
                {"role": "assistant", "content": llm_response}
            ])
            
            # Save updated job data
            job_path = f"data/users/{self.user_id}/jobs/{job_data['id']}/data.json"
            if not save_data(job_path, job_data):
                return create_error_response("Failed to save job data")
                
            # Return success with result
            return create_success_response({
                "assistant_response": llm_response,
                "job": job_data
            }, "Prompt processed successfully")
        except Exception as e:
            return create_error_response(f"Error processing prompt: {str(e)}")
    
    def _process_refine(self, job_data):
        """Refine input data using LLM"""
        # In a real implementation, this would analyze the inputs and provide refinement
        try:
            # Generate a refinement prompt based on the inputs
            inputs = job_data.get("inputs", [])
            if not inputs:
                return create_error_response("No inputs to refine")
                
            refinement_prompt = "Based on the following inputs, provide a refined summary:\n\n"
            
            for input_item in inputs:
                if input_item.get("type") == "web_search":
                    refinement_prompt += f"Web search for: {input_item.get('query', 'Unknown')}\n"
                    for result in input_item.get("results", []):
                        refinement_prompt += f"- {result.get('title', 'Unknown')}: {result.get('snippet', 'No snippet')}\n"
                elif input_item.get("type") == "rss_feed":
                    refinement_prompt += f"RSS feed from: {input_item.get('url', 'Unknown')}\n"
                    for item in input_item.get("items", []):
                        refinement_prompt += f"- {item.get('title', 'Unknown')}\n"
                elif input_item.get("type") == "file":
                    refinement_prompt += f"File content from: {input_item.get('name', 'Unknown')}\n"
                    refinement_prompt += f"{input_item.get('content', 'No content')[:200]}...\n"
            
            # Format messages for the LLM
            messages = [{"role": "user", "content": refinement_prompt}]
            
            # Call the LLM
            llm_response = generate_prompt(messages)
            
            if not llm_response:
                return create_error_response("Failed to get a refinement from the LLM")
                
            # Update job conversation
            if "conversation" not in job_data:
                job_data["conversation"] = []
                
            job_data["conversation"].extend([
                {"role": "user", "content": "Please refine my input data."},
                {"role": "assistant", "content": llm_response}
            ])
            
            # Save updated job data
            job_path = f"data/users/{self.user_id}/jobs/{job_data['id']}/data.json"
            if not save_data(job_path, job_data):
                return create_error_response("Failed to save job data")
                
            # Return success with result
            return create_success_response({
                "assistant_response": llm_response,
                "job": job_data
            }, "Inputs refined successfully")
        except Exception as e:
            return create_error_response(f"Error refining inputs: {str(e)}")
    
    def _process_reflect(self, job_data):
        """Generate self-reflection using LLM"""
        try:
            # Generate a reflection prompt based on the conversation
            conversation = job_data.get("conversation", [])
            if not conversation:
                return create_error_response("No conversation to reflect on")
                
            reflection_prompt = "Based on the following conversation, provide a thoughtful reflection on the information shared:\n\n"
            
            for message in conversation:
                role = message.get("role", "unknown")
                content = message.get("content", "")
                reflection_prompt += f"{role.capitalize()}: {content}\n\n"
            
            # Format messages for the LLM
            messages = [{"role": "user", "content": reflection_prompt}]
            
            # Call the LLM
            llm_response = generate_prompt(messages)
            
            if not llm_response:
                return create_error_response("Failed to get a reflection from the LLM")
                
            # Update job conversation
            job_data["conversation"].extend([
                {"role": "system", "content": "Self-reflection:"},
                {"role": "assistant", "content": llm_response}
            ])
            
            # Save updated job data
            job_path = f"data/users/{self.user_id}/jobs/{job_data['id']}/data.json"
            if not save_data(job_path, job_data):
                return create_error_response("Failed to save job data")
                
            # Return success with result
            return create_success_response({
                "assistant_response": llm_response,
                "job": job_data
            }, "Self-reflection generated successfully")
        except Exception as e:
            return create_error_response(f"Error generating reflection: {str(e)}")


class SaveOutputHandler(BaseHandler):
    """Handler for saving output files"""
    
    def validate_request(self, request_data):
        """Validate save output request"""
        if not request_data.get("file_name"):
            return False, "File name is required"
        if request_data.get("content") is None:
            return False, "Content is required"
        if not request_data.get("job_id"):
            return False, "Job ID is required"
        return True, None
    
    def process(self, response, request_data):
        """Save output to file"""
        if not self.user_id:
            return create_error_response("User ID is required")
            
        file_name = request_data.get("file_name")
        content = request_data.get("content")
        job_id = request_data.get("job_id")
        
        # Load job data
        job_path = f"data/users/{self.user_id}/jobs/{job_id}/data.json"
        job_data = load_data(job_path)
        
        if not job_data:
            return create_error_response("Job not found")
            
        # Add output to job
        if "outputs" not in job_data:
            job_data["outputs"] = []
            
        import time
        timestamp = int(time.time())
        
        output = {
            "file_name": file_name,
            "content": content,
            "timestamp": timestamp
        }
        
        job_data["outputs"].append(output)
        
        # Save updated job data
        if not save_data(job_path, job_data):
            return create_error_response("Failed to save job data")
            
        # Return success with updated job
        return create_success_response({
            "job": job_data
        }, f"Output saved as {file_name}")