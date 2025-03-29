"""
Authentication Routes Module for GameGen2

This module integrates the authentication handler with the HTTP server
by providing route handlers for login, registration, and logout endpoints.
"""

from http.server import BaseHTTPRequestHandler
from typing import Dict, Optional, Callable, Any
from urllib.parse import parse_qs, urlparse

from .auth_handler import AuthHandler


class AuthRoutes:
    """Authentication route handlers for the HTTP server"""

    def __init__(self, data_dir: str = "./data"):
        """
        Initialize the AuthRoutes with an authentication handler
        
        Args:
            data_dir: Directory containing user data files
        """
        self.auth_handler = AuthHandler(data_dir)
        self.auth_endpoints = {
            "/api/login": self._handle_login,
            "/api/register": self._handle_register,
            "/api/logout": self._handle_logout,
            "/api/check-auth": self._handle_check_auth,
        }

    def get_handler(self, path: str) -> Optional[Callable]:
        """
        Get the handler function for a given path
        
        Args:
            path: The request path
            
        Returns:
            Handler function if path is an authentication endpoint, None otherwise
        """
        parsed_path = urlparse(path).path
        return self.auth_endpoints.get(parsed_path)

    def _handle_post_data(self, request_handler: BaseHTTPRequestHandler) -> Dict:
        """
        Parse POST data from request
        
        Args:
            request_handler: The HTTP request handler
            
        Returns:
            Dictionary of POST data
        """
        content_length = int(request_handler.headers.get("Content-Length", 0))
        post_body = request_handler.rfile.read(content_length).decode("utf-8")
        return parse_qs(post_body)

    def _handle_login(self, request_handler: BaseHTTPRequestHandler) -> Dict:
        """
        Handle login request
        
        Args:
            request_handler: The HTTP request handler
            
        Returns:
            Response data dictionary
        """
        if request_handler.command != "POST":
            return {"status": "error", "message": "Method not allowed"}
        
        post_data = self._handle_post_data(request_handler)
        return self.auth_handler.handle_login(request_handler, post_data)

    def _handle_register(self, request_handler: BaseHTTPRequestHandler) -> Dict:
        """
        Handle registration request
        
        Args:
            request_handler: The HTTP request handler
            
        Returns:
            Response data dictionary
        """
        if request_handler.command != "POST":
            return {"status": "error", "message": "Method not allowed"}
        
        post_data = self._handle_post_data(request_handler)
        return self.auth_handler.handle_register(request_handler, post_data)

    def _handle_logout(self, request_handler: BaseHTTPRequestHandler) -> Dict:
        """
        Handle logout request
        
        Args:
            request_handler: The HTTP request handler
            
        Returns:
            Response data dictionary
        """
        cookies = self.auth_handler.get_cookie_from_headers(request_handler.headers)
        return self.auth_handler.handle_logout(request_handler, cookies)

    def _handle_check_auth(self, request_handler: BaseHTTPRequestHandler) -> Dict:
        """
        Handle authentication check request
        
        Args:
            request_handler: The HTTP request handler
            
        Returns:
            Response data dictionary
        """
        cookies = self.auth_handler.get_cookie_from_headers(request_handler.headers)
        user_id = self.auth_handler.check_auth(cookies)
        
        if user_id:
            return {"status": "success", "authenticated": True, "user_id": user_id}
        else:
            return {"status": "success", "authenticated": False}
            
    def check_authentication(self, request_handler: BaseHTTPRequestHandler) -> Optional[str]:
        """
        Check if a request is authenticated
        
        Args:
            request_handler: The HTTP request handler
            
        Returns:
            User ID if authenticated, None otherwise
        """
        cookies = self.auth_handler.get_cookie_from_headers(request_handler.headers)
        return self.auth_handler.check_auth(cookies)