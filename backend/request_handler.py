import http.server
import json

from http.cookies import SimpleCookie

import backend.database_handler as database_handler
import backend.login_handler as login_handler

def create_request_handler(server_instance):
    class RequestHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            self.server = server_instance
            self.config = server_instance.config
            super().__init__(*args, **kwargs)
        
        def do_GET(self):
            cookie = SimpleCookie(self.headers.get('Cookie'))
            if 'user_id' in cookie:
                user_id = cookie['user_id'].value
                users = database_handler.read_json_file(self.config['user_data_path'])
                if user_id in users:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    response = {"status": "success", "user_id": user_id}
                    self.wfile.write(json.dumps(response).encode('utf-8'))
                    return
                else:
                    self.send_response(403)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    error_response = {"status": "error", "message": "Forbidden"}
                    self.wfile.write(json.dumps(error_response).encode('utf-8'))
                    return

            else:
                self.send_response(403)
                self.end_headers()
                self.wfile.write(b"Forbidden")
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
                
    return RequestHandler