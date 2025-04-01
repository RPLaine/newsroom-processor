"""
Input handlers for processing various data input sources
"""
import requests
from urllib.parse import urlparse

from backend.handlers.base_handler import BaseHandler
from backend.utils.response_utils import create_success_response, create_error_response
from backend.utils.file_utils import load_data, save_data
from backend.utils.http_utils import make_get_request

class WebSearchHandler(BaseHandler):
    """Handler for web search requests"""
    
    def validate_request(self, request_data):
        """Validate web search request"""
        if not request_data.get("query"):
            return False, "Search query is required"
        if not request_data.get("job_id"):
            return False, "Job ID is required"
        return True, None
    
    def process(self, response, request_data):
        """Process web search request"""
        if not self.user_id:
            return create_error_response("User ID is required")
            
        query = request_data.get("query")
        job_id = request_data.get("job_id")
        
        # Simulate search results (in production, connect to a real search API)
        search_results = [
            {
                "title": f"Result for: {query}",
                "url": "https://example.com/result1",
                "snippet": f"This is a sample result for the search query: {query}"
            },
            {
                "title": f"Another result for: {query}",
                "url": "https://example.com/result2",
                "snippet": f"This is another sample result for: {query}"
            }
        ]
        
        # Load job data
        job_path = f"data/users/{self.user_id}/jobs/{job_id}/data.json"
        job_data = load_data(job_path)
        
        if not job_data:
            return create_error_response("Job not found")
            
        # Add search results to job inputs
        if "inputs" not in job_data:
            job_data["inputs"] = []
            
        job_data["inputs"].append({
            "type": "web_search",
            "query": query,
            "timestamp": job_data.get("created_at"),
            "results": search_results
        })
        
        # Save updated job data
        if not save_data(job_path, job_data):
            return create_error_response("Failed to save job data")
            
        # Return success with updated job
        return create_success_response({
            "job": job_data
        }, "Web search completed successfully")


class RSSHandler(BaseHandler):
    """Handler for RSS feed processing"""
    
    def validate_request(self, request_data):
        """Validate RSS request"""
        if not request_data.get("rss_url"):
            return False, "RSS URL is required"
        if not request_data.get("job_id"):
            return False, "Job ID is required"
            
        # Basic URL validation
        url = request_data.get("rss_url")
        try:
            result = urlparse(url)
            if not all([result.scheme, result.netloc]):
                return False, "Invalid URL format"
        except Exception:
            return False, "Invalid URL"
            
        return True, None
    
    def process(self, response, request_data):
        """Process RSS feed request"""
        if not self.user_id:
            return create_error_response("User ID is required")
            
        url = request_data.get("rss_url")
        job_id = request_data.get("job_id")
        
        # Simulate RSS feed items (in production, actually fetch and parse the RSS feed)
        rss_items = [
            {"title": "Sample RSS Item 1", "link": "https://example.com/item1", "description": "Description 1"},
            {"title": "Sample RSS Item 2", "link": "https://example.com/item2", "description": "Description 2"}
        ]
        
        # Load job data
        job_path = f"data/users/{self.user_id}/jobs/{job_id}/data.json"
        job_data = load_data(job_path)
        
        if not job_data:
            return create_error_response("Job not found")
            
        # Add RSS items to job inputs
        if "inputs" not in job_data:
            job_data["inputs"] = []
            
        job_data["inputs"].append({
            "type": "rss_feed",
            "url": url,
            "timestamp": job_data.get("created_at"),
            "items": rss_items
        })
        
        # Save updated job data
        if not save_data(job_path, job_data):
            return create_error_response("Failed to save job data")
            
        # Return success with updated job
        return create_success_response({
            "job": job_data
        }, "RSS feed processed successfully")


class FileHandler(BaseHandler):
    """Handler for file uploads"""
    
    def validate_request(self, request_data):
        """Validate file upload request"""
        if not request_data.get("file_name"):
            return False, "File name is required"
        if not request_data.get("file_content"):
            return False, "File content is required"
        if not request_data.get("job_id"):
            return False, "Job ID is required"
        return True, None
    
    def process(self, response, request_data):
        """Process file upload request"""
        if not self.user_id:
            return create_error_response("User ID is required")
            
        file_name = request_data.get("file_name")
        file_content = request_data.get("file_content")
        job_id = request_data.get("job_id")
        
        # Load job data
        job_path = f"data/users/{self.user_id}/jobs/{job_id}/data.json"
        job_data = load_data(job_path)
        
        if not job_data:
            return create_error_response("Job not found")
            
        # Add file to job inputs
        if "inputs" not in job_data:
            job_data["inputs"] = []
            
        job_data["inputs"].append({
            "type": "file",
            "name": file_name,
            "timestamp": job_data.get("created_at"),
            "content": file_content
        })
        
        # Save updated job data
        if not save_data(job_path, job_data):
            return create_error_response("Failed to save job data")
            
        # Return success with updated job
        return create_success_response({
            "job": job_data
        }, "File uploaded successfully")