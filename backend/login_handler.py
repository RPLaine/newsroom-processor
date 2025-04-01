import uuid
import time
import backend.file_handler as file_handler
import backend.structure_interpreter as structure_interpreter

def handle_login_actions(response, cookie, config):
    action = response["request"]["action"]
    user_data_path = config["user_data_path"]
    
    if action == "login":
        return handle_login(response, cookie, user_data_path)
    elif action == "register":
        return handle_register(response, cookie, user_data_path)
    elif action == "logout":
        return handle_logout(response, cookie, user_data_path)
    else:
        response["status"] = "error"
        response["message"] = f"Unknown login action: {action}"
        return response

def handle_login(response, cookie, user_data_path):
    request = response["request"]
    
    if "data" not in request or "email" not in request["data"] or "password" not in request["data"]:
        response["status"] = "error"
        response["message"] = "Invalid request format"
        return response

    email = request["data"]["email"]
    password = request["data"]["password"]
    
    users = file_handler.load_data(user_data_path)
    if not users:
        users = {}
    
    user_found = False
    for user_id, user_data in users.items():
        if user_data.get("email") == email and user_data.get("password") == password:
            user_found = True
            
            cookie["userid"] = user_id
            cookie["userid"]["path"] = "/"
            cookie["userid"]["max-age"] = 86400
            
            file_handler.update_last_login(user_id)
            
            auto_job_id = structure_interpreter.create_job_from_saved_structures(user_id)
            
            response["status"] = "success"
            response["message"] = "Login successful"
            response["userid"] = user_id
            response["data"] = {
                "user": {
                    "id": user_id,
                    "username": user_data.get("username"),
                    "email": email
                }
            }
            
            if auto_job_id:
                response["data"]["auto_job_created"] = True
                response["data"]["auto_job_id"] = auto_job_id
            
            response["set-cookie"] = cookie["userid"].OutputString()
            break
    
    if not user_found:
        response["status"] = "error"
        response["message"] = "Invalid email or password"
    
    return response

def handle_register(response, cookie, user_data_path):
    request = response["request"]

    if "data" not in request or "email" not in request["data"] or "password" not in request["data"]:
        response["status"] = "error"
        response["message"] = "Invalid request format"
        return response
    
    email = request["data"]["email"]
    password = request["data"]["password"]
    
    username = email.split('@')[0]
    
    users = file_handler.load_data(user_data_path)
    if not users:
        users = {}
    
    for user_data in users.values():
        if user_data.get("email") == email:
            response["status"] = "error"
            response["message"] = "Email already registered"
            return response
    
    user_id = str(uuid.uuid4())
    users[user_id] = {
        "username": username,
        "email": email,
        "password": password,
        "created_at": int(time.time())
    }
    
    if not file_handler.create_user_data_directory(user_id, username, email):
        response["status"] = "error"
        response["message"] = "Failed to create user data"
        return response
    
    if file_handler.save_data(user_data_path, users):
        cookie["userid"] = user_id
        cookie["userid"]["path"] = "/"
        cookie["userid"]["max-age"] = 86400
        
        response["status"] = "success"
        response["message"] = "Registration successful"
        response["userid"] = user_id
        response["data"] = {
            "user": {
                "id": user_id,
                "username": username,
                "email": email
            }
        }
        
        response["set-cookie"] = cookie["userid"].OutputString()
    else:
        response["status"] = "error"
        response["message"] = "Failed to register user"
    
    return response

def handle_logout(response, cookie, config):
    if "userid" in cookie:
        cookie["userid"] = ""
        cookie["userid"]["path"] = "/"
        cookie["userid"]["max-age"] = 0

        response["set-cookie"] = cookie["userid"].OutputString()
    
    response["status"] = "success"
    response["message"] = "Logout successful"
    response["userid"] = None
    
    return response