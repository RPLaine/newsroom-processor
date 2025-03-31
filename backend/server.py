import socketserver
import threading
import time

import backend.request_handler

class ApplicationServer:
    def __init__(self, config):
        self.config = config
        self.shutdown_flag = threading.Event()
        server_address = (self.config['host'], self.config['port'])
        self.httpd = socketserver.TCPServer(server_address, backend.request_handler.create_request_handler(self))
    
    def keyboard_interrupt_handler(self):
        while not self.shutdown_flag.is_set():
            try:
                time.sleep(1)
            except KeyboardInterrupt:
                break
        
        if not self.shutdown_flag.is_set():
            self.shutdown_flag.set()
            self.httpd.shutdown()
    
    def run(self):
        print("GameGen2 server")
        print(f"Started at http://localhost:{self.config['port']}")
        print("Press Ctrl+C to stop the server")
        
        interrupt_thread = threading.Thread(target=self.keyboard_interrupt_handler)
        interrupt_thread.daemon = True
        interrupt_thread.start()
        
        try:
            self.httpd.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            self.shutdown_flag.set()
            self.httpd.server_close()

    @staticmethod
    def run_server(config):
        server = ApplicationServer(config)
        server.run()