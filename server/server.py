"""
GameGen2 Server Module

This module contains the main server class that manages the HTTP server and request handling.
"""

import socketserver

# Import our authentication module
from login.auth_routes import AuthRoutes
from .request_handler import create_request_handler

class GameGen2Server:
    """Main server class that manages the HTTP server and request handling"""
    
    def __init__(self, port=8001, data_dir="./data", debug=False):
        """
        Initialize the GameGen2 server
        
        Args:
            port: The port to run the server on
            data_dir: Directory containing user data files
            debug: Whether to enable debug mode
        """
        self.port = port
        self.data_dir = data_dir
        self.debug = debug
        self.auth_routes = AuthRoutes(data_dir)
        
        # Create request handler with access to server instance
        handler = create_request_handler(self)
        
        # Set server address
        self.server_address = ('', port)
        
        # Create the HTTP server
        self.httpd = socketserver.TCPServer(self.server_address, handler)
    
    def run(self):
        """Run the server"""
        print(f"Server started at http://localhost:{self.port}")
        if self.debug:
            print("Running in DEBUG mode")
        print("Press Ctrl+C to stop the server")
        
        try:
            # Start the server
            self.httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
            self.httpd.server_close()
            print("Server stopped gracefully.")

    @staticmethod
    def run_server(port=8001, data_dir="./data", debug=False):
        """Run the GameGen2 server with the specified configuration"""
        server = GameGen2Server(port, data_dir, debug)
        server.run()