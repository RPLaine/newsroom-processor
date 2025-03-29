import http.server
import socketserver
import os
import json
import urllib.parse
from urllib.parse import urlparse, parse_qs
from http.cookies import SimpleCookie
from typing import Optional, Dict, List, Any, Tuple

# Import our authentication module
from login.auth_routes import AuthRoutes


class GameGen2RequestHandler(http.server.SimpleHTTPRequestHandler):
    # Only allow specific file extensions to be served
    ALLOWED_EXTENSIONS = ['.html', '.js', '.css', '.svg', '.ico', '.png', '.jpg', '.gif']
    
    # Pages that don't require authentication
    PUBLIC_PAGES = ['/login/login.html', '/login/login.js', '/login/login.css', '/favicon.svg']
    
    # Initialize authentication handler
    auth_routes = AuthRoutes("./data")
    
    def do_GET(self):
        """Handle GET requests"""
        # Parse the URL to get the file extension
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # Check for authentication API endpoints first
        auth_handler = self.auth_routes.get_handler(path)
        if auth_handler:
            self._handle_json_response(auth_handler(self))
            return
            
        # If path is root, serve index.html by default
        if path == '/':
            self.path = '/index.html'
            path = self.path
            
        # Check if the path requires authentication
        if not self._is_public_path(path) and not self._check_authentication():
            # Redirect to login page
            self.send_response(302)  # Found/Redirect
            self.send_header('Location', '/login/login.html')
            self.end_headers()
            return
        
        # Get file extension
        _, file_extension = os.path.splitext(path)
        
        # Only serve allowed file types
        if file_extension in self.ALLOWED_EXTENSIONS:
            # Use the parent class's method to serve the file
            super().do_GET()
        else:
            # Return 403 Forbidden for non-allowed file types
            self.send_response(403)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'403 Forbidden: Only allowed file types are served.')

    def do_POST(self):
        """Handle POST requests"""
        # Parse the URL
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # Check for authentication API endpoints
        auth_handler = self.auth_routes.get_handler(path)
        if auth_handler:
            self._handle_json_response(auth_handler(self))
            return
            
        # If not an API endpoint, return 404
        self.send_response(404)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {"status": "error", "message": "Not Found"}
        self.wfile.write(json.dumps(response).encode())

    def _is_public_path(self, path: str) -> bool:
        """
        Check if a path is public (doesn't require authentication)
        
        Args:
            path: The request path
            
        Returns:
            True if the path is public, False otherwise
        """
        # Root path redirects to index.html, which requires auth
        if path == '/':
            return False
            
        # API paths don't require auth checks here (they handle their own)
        if path.startswith('/api/'):
            return True
            
        # Check against the list of public paths
        for public_path in self.PUBLIC_PAGES:
            # Exact match or serving a file in a public directory
            if path == public_path or (public_path.endswith('/') and path.startswith(public_path)):
                return True
                
        return False
        
    def _check_authentication(self) -> bool:
        """
        Check if the request is authenticated
        
        Returns:
            True if authenticated, False otherwise
        """
        user_id = self.auth_routes.check_authentication(self)
        return user_id is not None
        
    def _handle_json_response(self, response_data: Dict[str, Any]) -> None:
        """
        Send a JSON response
        
        Args:
            response_data: The data to send as JSON
        """
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        # Add any headers that may have been set by the handlers
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode())


def run_server(port=8001):
    """
    Run the GameGen2 server
    
    Args:
        port: The port to run the server on
    """
    handler = GameGen2RequestHandler
    
    # Set the server address to localhost on specified port
    server_address = ('', port)
    
    # Create the HTTP server
    httpd = socketserver.TCPServer(server_address, handler)
    
    print(f"Server started at http://localhost:{port}")
    print("Serving HTML, JavaScript, CSS, and other allowed files only")
    print("Press Ctrl+C to stop the server")
    
    try:
        # Start the server
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
        print("Server stopped.")


if __name__ == "__main__":
    run_server()