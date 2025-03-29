import http.server
import socketserver
import os
from urllib.parse import urlparse

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    # Only allow specific file extensions to be served
    ALLOWED_EXTENSIONS = ['.html', '.js', '.css', '.svg']
    
    def do_GET(self):
        # Parse the URL to get the file extension
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # If path is root, serve index.html by default
        if path == '/':
            self.path = '/index.html'
            path = self.path
        
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
            self.wfile.write(b'403 Forbidden: Only HTML, JavaScript, CSS, and SVG files are served.')

def run_server(port=8001):
    handler = CustomHTTPRequestHandler
    
    # Set the server address to localhost on specified port
    server_address = ('', port)
    
    # Create the HTTP server
    httpd = socketserver.TCPServer(server_address, handler)
    
    print(f"Server started at http://localhost:{port}")
    print("Serving HTML, JavaScript, CSS, and SVG files only")
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