import http.server
import json
from http.cookies import SimpleCookie
import backend.file_handler as file_handler
import backend.html_constructor as html_constructor
import backend.login_handler as login_handler
import backend.application_handler as application_handler

def create_request_handler(server, config):
    class RequestHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            self.server = server
            self.config = config
            super().__init__(*args, **kwargs)

        def do_OPTIONS(self):
            self.send_response(200)
            self.send_cors_headers()
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
        def do_GET(self):
            if self.path == '/':
                response = html_constructor.generate_html(self.config)
                self.send_html_response(response)
                return
            elif any(self.path.endswith(ext) for ext in self.config["allowed_extensions"]):
                super().do_GET()
                return
            self.send_error(404, "File not found")
            return
        
        def do_POST(self):
            response = {}
            response["request"] = self.load_request_dictionary()
            cookie = SimpleCookie(self.headers.get('Cookie'))

            if 'userid' in cookie and file_handler.is_user_id_valid(cookie['userid'].value, config["user_data_path"]):
                user_id = cookie['userid'].value
                response["userid"] = user_id
                response["userdata"] = file_handler.load_user_data(user_id)

            if 'action' in response["request"]:
                if response["request"]["action"] in ["login", "register", "logout"]:
                    response = login_handler.handle_login_actions(response, cookie, self.config)
                else:
                    response = application_handler.handle_application_actions(response)
                    
            self.send_json_response(response, cookie)
            return
        
        def load_request_dictionary(self):
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            return data
        
        def send_cors_headers(self):
            origin = self.headers.get('Origin')
            if self.headers.get('Origin'):
                self.send_header('Access-Control-Allow-Origin', origin)
                self.send_header('Access-Control-Allow-Credentials', 'true')
            else:
                self.send_header('Access-Control-Allow-Origin', '*')
            
        def send_json_response(self, response_data, cookie):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            if 'userid' in cookie:
                cookie["userid"]["secure"] = True
                cookie["userid"]["httponly"] = True
                self.send_header('Set-Cookie', cookie["userid"].OutputString())
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

        def send_html_response(self, html_content):
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(html_content.encode('utf-8'))
                
    return RequestHandler