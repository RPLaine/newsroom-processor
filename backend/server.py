import socketserver
import threading
import backend.request_handler as request_handler

class ApplicationServer:
    def __init__(self, config):
        self.config = config
        self.shutdown_flag = threading.Event()
        server_address = (self.config['host'], self.config['port'])
        self.httpd = socketserver.TCPServer(
            server_address, 
            request_handler.create_request_handler(self, config)
            )
        self.httpd.allow_reuse_address = True
    
    def run(self):
        print("GameGen2 server")
        print(f"Started at http://localhost:{self.config['port']}")
        print("Press Ctrl+C to stop the server")
        
        try:
            self.httpd.serve_forever(poll_interval=0.1)
        except KeyboardInterrupt:
            print("\nShutting down server...")
        finally:
            self.shutdown_flag.set()
            self.httpd.server_close()
            print("Server stopped")

    @staticmethod
    def run_server(config):
        server = ApplicationServer(config)
        server.run()