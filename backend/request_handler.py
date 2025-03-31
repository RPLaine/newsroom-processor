import http.server
import json

from http.cookies import SimpleCookie

import backend.database_handler as database_handler

def create_request_handler(server_instance):
    class RequestHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            self.server = server_instance
            self.config = server_instance.config
            super().__init__(*args, **kwargs)
        
        def do_GET(self):
            cookie = SimpleCookie(self.headers.get('Cookie'))
            if 'userid' in cookie:
                userid = cookie['userid'].value
                users = database_handler.read_json_file(self.config['user_data_path'])
                if userid in users:
                    response = {"status": "userid is in the database", "userid": userid}
                    self.send_json_response(200, response)
                    return
                else:
                    response = {"status": "userid is not in the database"}
                    self.send_json_response(200, response)
                    return 
            else:
                response = {"status": "userid is not in cookie"}
                self.send_json_response(200, response)
                return

        def do_POST(self):
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                database_handler.write_json_file(self.config['data_dir'] + 'test.json', data)
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {"status": "success", "message": "Data received successfully"}
                self.wfile.write(json.dumps(response).encode('utf-8'))
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                error_response = {"status": "error", "message": "Invalid JSON data"}
                self.wfile.write(json.dumps(error_response).encode('utf-8'))
                return
            
        def send_json_response(self, status_code, response_data):
            """Helper method to send JSON responses with proper headers"""
            self.send_response(status_code)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
                
    return RequestHandler