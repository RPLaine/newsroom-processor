import http.server
import json
from http.cookies import SimpleCookie
import backend.database_handler as database_handler
import backend.html_constructor as html_constructor

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

            # Load the request dictionary
            response["request"] = self.load_request_dictionary()

            # Load the cookie
            cookie = SimpleCookie(self.headers.get('Cookie'))

            # Validate user_id from the cookie
            if 'userid' in cookie and database_handler.is_user_id_valid(cookie['userid'].value, config["user_data_path"]):
                response['userid_in_database'] = True
                response["userid"] = cookie['userid'].value
            else:
                response['userid_in_database'] = False
                response["userid"] = None
                self.send_json_response(response)
                return

            # Send the response
            self.send_json_response(response)
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
            
        def send_json_response(self, response_data):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

        def send_html_response(self, html_content):
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(html_content.encode('utf-8'))
                
    return RequestHandler