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
                respose = html_constructor.generate_html(self.config)
                self.send_html_response(200, respose)
                return
            elif any(self.path.endswith(ext) for ext in self.config["allowed_extensions"]):
                super().do_GET()
                return
            else:
                self.send_error(404, "File not found")
                return
        
        # def do_GET(self):
        #     cookie = SimpleCookie(self.headers.get('Cookie'))
        #     if 'userid' in cookie:
        #         userid = cookie['userid'].value
        #         users = database_handler.read_json_file(self.config['user_data_path'])
        #         if userid in users:
        #             response = {"status": "userid is in the database", "userid": userid}
        #             self.send_json_response(200, response)
        #             return
        #         else:
        #             response = {"status": "userid is not in the database"}
        #             self.send_json_response(200, response)
        #             return 
        #     else:
        #         response = {"status": "userid is not in cookie"}
        #         self.send_json_response(200, response)
        #         return

        def do_POST(self):
            response = {}
            response["request"] = self.load_request_dictionary()
            if response["request"] is None:
                self.send_json_response(400, response)
                return
            self.send_json_response(200, response)
            return
        
        def load_request_dictionary(self):
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                return data
            except json.JSONDecodeError:
                return {"error": "rfile is not a valid JSON"}
            except Exception as e:
                return {"error": str(e)}
            
        def send_json_response(self, status_code, response_data):
            self.send_response(status_code)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

        def send_html_response(self, status_code, html_content):
            self.send_response(status_code)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(html_content.encode('utf-8'))
                
    return RequestHandler