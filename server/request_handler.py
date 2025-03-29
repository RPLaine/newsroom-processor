"""
Request Handler Modules

This module contains the HTTP request handler for the GameGen2 server.
"""

import http.server
import json
import os
import sys
from typing import Dict, Any
from urllib.parse import urlparse

def create_request_handler(server_instance):
    """Create a request handler class with access to the server instance"""
    
    class GameGen2RequestHandler(http.server.SimpleHTTPRequestHandler):
        # Only allow specific file extensions to be served
        ALLOWED_EXTENSIONS = ['.html', '.js', '.css', '.svg', '.ico', '.png', '.jpg', '.gif', '.json']
        
        # All asset directories that should be served without authentication
        PUBLIC_DIRS = [
            '/styling/',
            '/login/',
        ]
        
        # Specific assets that don't require authentication
        PUBLIC_ASSETS = [
            '/favicon.svg',
            '/styling/variables.css',
            '/styling/animations.css',
            '/styling/app.css',
            '/styling/theme.json',
            '/styling/styling.js',
            '/login/login.css',
            '/login/login.js',
            '/script.js',
        ]
        
        def __init__(self, *args, **kwargs):
            self.server = server_instance
            super().__init__(*args, **kwargs)
        
        def log_message(self, format, *args):
            """Override log_message to provide more detailed logging in debug mode"""
            # Access debug attribute from the server instance
            if hasattr(self.server, 'debug') and self.server.debug:
                sys.stderr.write("%s - - [%s] %s\n" %
                                (self.address_string(),
                                self.log_date_time_string(),
                                format % args))

        def do_GET(self):
            """Handle GET requests with simplified routing"""
            # Log request in debug mode
            if hasattr(self.server, 'debug') and self.server.debug:
                print(f"GET Request: {self.path}")
            
            # Parse the URL
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            
            # Check for API endpoints first
            if path.startswith('/api/'):
                auth_handler = self.server.auth_routes.get_handler(path)
                if auth_handler:
                    self._handle_json_response(auth_handler(self))
                    return
                else:
                    # If API endpoint not found, return 404
                    self._handle_json_response({
                        "status": "error", 
                        "message": "API endpoint not found"
                    }, status_code=404)
                    return
            
            # Handle static assets (CSS, JS, images)
            _, file_extension = os.path.splitext(path)
            is_asset = file_extension in self.ALLOWED_EXTENSIONS
            is_public_asset = path in self.PUBLIC_ASSETS or any(path.startswith(d) for d in self.PUBLIC_DIRS)
            
            # If path is root, or it's an allowed asset type, serve it
            if path == '/' or (is_asset and is_public_asset):
                if path == '/':
                    self.path = '/index.html'
                if hasattr(self.server, 'debug') and self.server.debug:
                    print(f"Serving file: {self.path}")
                return super().do_GET()
            
            # Serve index.html for non-asset requests explicitly
            if not is_asset:
                self.path = '/index.html'
                if hasattr(self.server, 'debug') and self.server.debug:
                    print(f"Serving index.html for non-asset request: {path}")
                return super().do_GET()

            # At this point, we have an asset that might need authentication
            user_id = self.server.auth_routes.check_authentication(self)
            if not user_id:
                # For AJAX requests, return 401
                if 'X-Requested-With' in self.headers and self.headers['X-Requested-With'] == 'XMLHttpRequest':
                    self._handle_json_response({
                        "status": "error", 
                        "message": "Authentication required"
                    }, status_code=401)
                    if hasattr(self.server, 'debug') and self.server.debug:
                        print(f"Rejected AJAX request: {path}")
                    return
                else:
                    # For direct requests, return 401 Unauthorized
                    self.send_response(401)
                    self.end_headers()
                    if hasattr(self.server, 'debug') and self.server.debug:
                        print(f"Rejected direct request due to missing auth: {path}")
                    return
            
            # Authenticated, serve the file
            if hasattr(self.server, 'debug') and self.server.debug:
                print(f"Auth OK, serving: {path}")
            return super().do_GET()
        
        def do_POST(self):
            """Handle POST requests"""
            # Parse the URL
            parsed_url = urlparse(self.path)
            path = parsed_url.path
            
            # Check for API endpoints
            if path.startswith('/api/'):
                auth_handler = self.server.auth_routes.get_handler(path)
                if auth_handler:
                    self._handle_json_response(auth_handler(self))
                    return
            
            # If not an API endpoint, return 404
            self._handle_json_response({
                "status": "error", 
                "message": "Not Found"
            }, status_code=404)
        
        def _handle_json_response(self, response_data: Dict[str, Any], status_code: int = 200) -> None:
            """Send a JSON response"""
            try:
                self.send_response(status_code)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode())
            except (TypeError, ValueError) as e:
                # Handle JSON encoding errors
                self.send_response(500)
                self.end_headers()
                if hasattr(self.server, 'debug') and self.server.debug:
                    print(f"Error encoding JSON response: {e}")
    
    return GameGen2RequestHandler