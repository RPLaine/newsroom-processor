"""
Authentication Handler Module for GameGen2

This module provides HTTP request handlers for user authentication,
registration, and session management.
"""

import os
import json
import urllib.parse
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler
from typing import Dict, Optional, Tuple, Any, List
from urllib.parse import parse_qs, urlparse

from .user_manager import UserManager


class AuthHandler:
    """Authentication handler for HTTP requests"""

    def __init__(self, data_dir: str = "../data"):
        """
        Initialize the AuthHandler with paths to database files
        
        Args:
            data_dir: Directory containing user data files
        """
        self.user_manager = UserManager(
            os.path.join(data_dir, "users.json"),
            os.path.join(data_dir, "sessions.json")
        )
        self.cookie_name = "uid"
        self.cookie_path = "/"
        self.cookie_max_age = 30 * 24 * 60 * 60  # 30 days in seconds
    
    def get_cookie_from_headers(self, headers: Dict[str, str]) -> Dict[str, str]:
        """
        Extract cookies from HTTP headers
        
        Args:
            headers: HTTP headers dictionary
            
        Returns:
            Dictionary of cookie name-value pairs
        """
        cookie = SimpleCookie()
        if "Cookie" in headers:
            cookie.load(headers["Cookie"])
        
        result = {}
        for key, morsel in cookie.items():
            result[key] = morsel.value
        return result
    
    def build_set_cookie_header(self, name: str, value: str, 
                               max_age: int = None, path: str = "/",
                               http_only: bool = True) -> str:
        """
        Build a Set-Cookie header value
        
        Args:
            name: Cookie name
            value: Cookie value
            max_age: Cookie max age in seconds
            path: Cookie path
            http_only: Whether the cookie is HTTP only
            
        Returns:
            Set-Cookie header value
        """
        cookie = SimpleCookie()
        cookie[name] = value
        if max_age:
            cookie[name]["max-age"] = max_age
        if path:
            cookie[name]["path"] = path
        if http_only:
            cookie[name]["httponly"] = True
        
        # Return just the part after "Set-Cookie: "
        return cookie.output(header="").lstrip()
    
    def handle_login(self, request_handler: BaseHTTPRequestHandler, 
                    post_data: Dict[str, List[str]]) -> Dict[str, Any]:
        """
        Handle login request
        
        Args:
            request_handler: The HTTP request handler
            post_data: POST data from the request
            
        Returns:
            Response data dictionary with status and message
        """
        # Check if email and password are provided
        if "email" not in post_data or "password" not in post_data:
            return {"status": "error", "message": "Email and password are required"}
        
        email = post_data["email"][0]
        password = post_data["password"][0]
        
        # Authenticate user
        user_id = self.user_manager.authenticate(email, password)
        if not user_id:
            return {"status": "error", "message": "Invalid email or password"}
        
        # Create session
        session_id = self.user_manager.create_session(user_id)
        
        # Set cookie
        cookie_header = self.build_set_cookie_header(
            self.cookie_name, 
            session_id,
            self.cookie_max_age,
            self.cookie_path
        )
        request_handler.send_header("Set-Cookie", cookie_header)
        
        return {
            "status": "success",
            "message": "Login successful",
            "redirect": "/"
        }
    
    def handle_register(self, request_handler: BaseHTTPRequestHandler,
                       post_data: Dict[str, List[str]]) -> Dict[str, Any]:
        """
        Handle registration request
        
        Args:
            request_handler: The HTTP request handler
            post_data: POST data from the request
            
        Returns:
            Response data dictionary with status and message
        """
        # Check if email and password are provided
        if "email" not in post_data or "password" not in post_data:
            return {"status": "error", "message": "Email and password are required"}
        
        email = post_data["email"][0]
        password = post_data["password"][0]
        
        # Basic validation
        if not email or not password:
            return {"status": "error", "message": "Email and password cannot be empty"}
        
        # Register user
        success = self.user_manager.register_user(email, password)
        if not success:
            return {"status": "error", "message": "User already exists"}
        
        # Authenticate user
        user_id = self.user_manager.authenticate(email, password)
        
        # Create session
        session_id = self.user_manager.create_session(user_id)
        
        # Set cookie
        cookie_header = self.build_set_cookie_header(
            self.cookie_name, 
            session_id,
            self.cookie_max_age,
            self.cookie_path
        )
        request_handler.send_header("Set-Cookie", cookie_header)
        
        return {
            "status": "success",
            "message": "Registration successful",
            "redirect": "/"
        }
    
    def handle_logout(self, request_handler: BaseHTTPRequestHandler,
                     cookies: Dict[str, str]) -> Dict[str, Any]:
        """
        Handle logout request
        
        Args:
            request_handler: The HTTP request handler
            cookies: Cookie dictionary from the request
            
        Returns:
            Response data dictionary with status and message
        """
        # Check if user is logged in
        if self.cookie_name not in cookies:
            return {"status": "error", "message": "Not logged in"}
        
        # Get session ID
        session_id = cookies[self.cookie_name]
        
        # Invalidate session
        self.user_manager.invalidate_session(session_id)
        
        # Clear cookie
        cookie_header = self.build_set_cookie_header(
            self.cookie_name, 
            "",
            0,  # Expire immediately
            self.cookie_path
        )
        request_handler.send_header("Set-Cookie", cookie_header)
        
        return {
            "status": "success",
            "message": "Logout successful",
            "redirect": "/login/login.html"
        }
    
    def check_auth(self, cookies: Dict[str, str]) -> Optional[str]:
        """
        Check if the user is authenticated
        
        Args:
            cookies: Cookie dictionary from the request
            
        Returns:
            User ID if authenticated, None otherwise
        """
        # Check if cookie exists
        if self.cookie_name not in cookies:
            return None
        
        # Get session ID
        session_id = cookies[self.cookie_name]
        
        # Validate session
        user_id = self.user_manager.validate_session(session_id)
        return user_id