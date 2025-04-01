import http.server
import json
from http.cookies import SimpleCookie
import backend.database_handler as database_handler
import backend.html_constructor as html_constructor
import backend.login_handler as login_handler
import backend.user_handler as user_handler

def create_request_handler(server, config):
    class RequestHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            self.server = server
            self.config = config
            super().__init__(*args, **kwargs)

        def do_GET(self):
            if self.path == '/':
                response = html_constructor.generate_html(self.config)
                self.send_html_response(response)
                return
            elif any(self.path.endswith(ext) for ext in self.config["allowed_extensions"]):
                super().do_GET()
                return
            else:
                self.send_error(404, "File not found")
                return
        
        def do_POST(self):
            response = {}
            response["request"] = self.load_request_dictionary()
            cookie = SimpleCookie(self.headers.get('Cookie'))

            if 'userid' in cookie and database_handler.is_user_id_valid(cookie['userid'].value, config["user_data_path"]):
                user_id = cookie['userid'].value
                response["userid"] = user_id
                response["userdata"] = user_handler.get_user_data(user_id)
            elif response["request"]["action"] == "login":
                response = login_handler.handle_login(response, cookie, self.config["user_data_path"])
                self.send_json_response(response, cookie)
                return
            elif response["request"]["action"] == "register":
                response = login_handler.handle_register(response, cookie, self.config["user_data_path"])
                self.send_json_response(response, cookie)
                return
            elif response["request"]["action"] == "logout":
                response = login_handler.handle_logout(response, cookie, self.config["user_data_path"])
                self.send_json_response(response, cookie)
                return
            else:
                response["userid"] = None
                self.send_json_response(response, cookie)
                return

            self.send_json_response(response, cookie)
            return
        
        def load_request_dictionary(self):
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                print(json.dumps(data, indent=4))
                return data
            except json.JSONDecodeError:
                return {"error": "rfile is not a valid JSON"}
            except Exception as e:
                return {"error": str(e)}
            
        def send_json_response(self, response_data, cookie):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Set-Cookie', cookie["userid"].OutputString())
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

        def send_html_response(self, html_content):
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(html_content.encode('utf-8'))
                
    return RequestHandler