import uuid
import time
import backend.database_handler as database_handler
import backend.user_handler as user_handler
from http.cookies import SimpleCookie

def handle_login(response, cookie, user_data_path):
    """
    Handle login request
    
    Args:
        response: Response object containing request data
        cookie: Cookie object for session management
        user_data_path: Path to users data file
        
    Returns:
        Updated response object with login status
    """
    request = response["request"]
    
    # Validate request format
    if "data" not in request or "email" not in request["data"] or "password" not in request["data"]:
        response["status"] = "error"
        response["message"] = "Invalid request format"
        return response
    
    # Get user data from request
    email = request["data"]["email"]
    password = request["data"]["password"]
    
    # Load user database
    users = database_handler.read_json_file(user_data_path)
    if not users:
        users = {}
    
    # Check email and password
    user_found = False
    for user_id, user_data in users.items():
        if user_data.get("email") == email and user_data.get("password") == password:
            user_found = True
            
            # Set cookie
            cookie["userid"] = user_id
            cookie["userid"]["path"] = "/"
            cookie["userid"]["max-age"] = 86400  # 24 hours
            
            # Update last login time
            user_handler.update_last_login(user_id)
            
            # Update response
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
            
            # Set cookie header
            response["set-cookie"] = cookie["userid"].OutputString()
            break
    
    if not user_found:
        response["status"] = "error"
        response["message"] = "Invalid email or password"
    
    return response

def handle_register(response, cookie, user_data_path):
    """
    Handle user registration
    
    Args:
        response: Response object containing request data
        cookie: Cookie object for session management
        user_data_path: Path to users data file
        
    Returns:
        Updated response object with registration status
    """
    request = response["request"]
    
    # Validate request format
    if "data" not in request or "email" not in request["data"] or "password" not in request["data"]:
        response["status"] = "error"
        response["message"] = "Invalid request format"
        return response
    
    # Get user data from request
    email = request["data"]["email"]
    password = request["data"]["password"]
    
    # Extract username from email (before @)
    username = email.split('@')[0]
    
    # Load user database
    users = database_handler.read_json_file(user_data_path)
    if not users:
        users = {}
    
    # Check if email already exists
    for user_data in users.values():
        if user_data.get("email") == email:
            response["status"] = "error"
            response["message"] = "Email already registered"
            return response
    
    # Create new user with UUID as userid
    user_id = str(uuid.uuid4())
    users[user_id] = {
        "username": username,
        "email": email,
        "password": password,
        "created_at": int(time.time())
    }
    
    # Create user directory and initial data.json
    if not user_handler.create_user_data_directory(user_id, username, email):
        response["status"] = "error"
        response["message"] = "Failed to create user data"
        return response
    
    # Save to main user database
    if database_handler.write_json_file(user_data_path, users):
        # Set cookie to automatically log in the user
        cookie["userid"] = user_id
        cookie["userid"]["path"] = "/"
        cookie["userid"]["max-age"] = 86400  # 24 hours
        
        # Update response with success and user data
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
        
        # Set cookie header
        response["set-cookie"] = cookie["userid"].OutputString()
    else:
        response["status"] = "error"
        response["message"] = "Failed to register user"
    
    return response

def handle_logout(response, cookie, user_data_path):
    """
    Handle logout request
    
    Args:
        response: Response object containing request data
        cookie: Cookie object for session management
        user_data_path: Path to users data file
        
    Returns:
        Updated response object with logout status
    """
    # Clear the userid cookie
    if "userid" in cookie:
        cookie["userid"] = ""
        cookie["userid"]["path"] = "/"
        cookie["userid"]["max-age"] = 0
        
        # Set cookie header
        response["set-cookie"] = cookie["userid"].OutputString()
    
    response["status"] = "success"
    response["message"] = "Logout successful"
    response["userid"] = None
    
    return response