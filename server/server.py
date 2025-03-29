"""
GameGen2 Server Module

This module contains the main server class that manages the HTTP server and request handling.
"""

import socketserver
import threading
import time
import sys

# Import our authentication module
from login.auth_routes import AuthRoutes
from .request_handler import create_request_handler

class GameServer:
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
        self.shutdown_flag = threading.Event()
        
        # Create request handler with access to server instance
        handler = create_request_handler(self)
        
        # Set server address
        self.server_address = ('', port)
        
        # Create the HTTP server
        self.httpd = socketserver.TCPServer(self.server_address, handler)
        
        # Transfer key attributes to the TCPServer instance so they're accessible to the handler
        self.httpd.auth_routes = self.auth_routes
        self.httpd.debug = self.debug
    
    def keyboard_interrupt_handler(self):
        """Handle keyboard interrupt in a separate thread"""
        try:
            # Wait until shutdown flag is set or Ctrl+C is pressed
            while not self.shutdown_flag.is_set():
                try:
                    time.sleep(0.1)  # Short sleep to prevent CPU hogging
                except KeyboardInterrupt:
                    break
            
            # If we get here, either Ctrl+C was pressed or shutdown was called
            if not self.shutdown_flag.is_set():
                print("\nShutting down server...")
                self.shutdown_flag.set()
                self.httpd.shutdown()
        except Exception as e:
            print(f"Error in keyboard interrupt handler: {e}")
    
    def run(self):
        """Run the server"""
        print(f"Server started at http://localhost:{self.port}")
        if self.debug:
            print("Running in DEBUG mode")
        print("Press Ctrl+C to stop the server")
        
        # Start a thread to handle keyboard interrupts
        interrupt_thread = threading.Thread(target=self.keyboard_interrupt_handler)
        interrupt_thread.daemon = True
        interrupt_thread.start()
        
        try:
            # Start the server
            self.httpd.serve_forever()
        except KeyboardInterrupt:
            # This is a fallback in case the interrupt thread doesn't catch it
            pass
        finally:
            # Set the shutdown flag to stop the interrupt thread
            self.shutdown_flag.set()
            
            # Gracefully close the server if not already closed
            try:
                self.httpd.server_close()
            except Exception as e:
                if self.debug:
                    print(f"Error during server shutdown: {e}")
            
            print("Server stopped gracefully.")

    @staticmethod
    def run_server(port=8001, data_dir="./data", debug=False):
        """Run the GameGen2 server with the specified configuration"""
        server = GameServer(port, data_dir, debug)
        server.run()