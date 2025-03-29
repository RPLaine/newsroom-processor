"""
User Manager Module for GameGen2

This module handles user registration, authentication, and session management
using only built-in Python libraries.
"""

import json
import os
import hashlib
import secrets
import time
from typing import Dict, Optional, Tuple, Any


class UserManager:
    """User management class for handling authentication and session tracking"""

    def __init__(self, user_db_path: str = "../data/users.json", 
                 session_db_path: str = "../data/sessions.json"):
        """
        Initialize the UserManager
        
        Args:
            user_db_path: Path to the user database JSON file
            session_db_path: Path to the session database JSON file
        """
        self.user_db_path = user_db_path
        self.session_db_path = session_db_path
        
        # Ensure data directory and files exist
        os.makedirs(os.path.dirname(os.path.abspath(user_db_path)), exist_ok=True)
        
        # Initialize user database if it doesn't exist
        if not os.path.exists(user_db_path):
            with open(user_db_path, 'w') as f:
                json.dump({}, f)
        
        # Initialize session database if it doesn't exist
        if not os.path.exists(session_db_path):
            with open(session_db_path, 'w') as f:
                json.dump({}, f)
    
    def _load_user_db(self) -> Dict:
        """Load the user database from disk"""
        try:
            with open(self.user_db_path, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {}
    
    def _save_user_db(self, user_db: Dict) -> None:
        """Save the user database to disk"""
        with open(self.user_db_path, 'w') as f:
            json.dump(user_db, f, indent=2)
    
    def _load_session_db(self) -> Dict:
        """Load the session database from disk"""
        try:
            with open(self.session_db_path, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {}
    
    def _save_session_db(self, session_db: Dict) -> None:
        """Save the session database to disk"""
        with open(self.session_db_path, 'w') as f:
            json.dump(session_db, f, indent=2)
    
    def _hash_password(self, password: str, salt: Optional[str] = None) -> Tuple[str, str]:
        """
        Hash a password with a salt using SHA-256
        
        Args:
            password: The plain text password
            salt: Optional salt string, generated if not provided
            
        Returns:
            Tuple of (hashed_password, salt)
        """
        if salt is None:
            salt = secrets.token_hex(16)
        
        # Combine password and salt, then hash
        hash_obj = hashlib.sha256((password + salt).encode())
        return hash_obj.hexdigest(), salt
    
    def register_user(self, email: str, password: str) -> bool:
        """
        Register a new user
        
        Args:
            email: User's email address
            password: User's password
            
        Returns:
            True if registration successful, False if user already exists
        """
        # Normalize email
        email = email.lower().strip()
        
        # Load user database
        user_db = self._load_user_db()
        
        # Check if user already exists
        if email in user_db:
            return False
        
        # Hash password
        password_hash, salt = self._hash_password(password)
        
        # Create user record
        user_db[email] = {
            "password_hash": password_hash,
            "salt": salt,
            "created_at": int(time.time()),
            "last_login": None
        }
        
        # Save user database
        self._save_user_db(user_db)
        return True
    
    def authenticate(self, email: str, password: str) -> Optional[str]:
        """
        Authenticate a user
        
        Args:
            email: User's email address
            password: User's password
            
        Returns:
            User ID (email) if authentication successful, None otherwise
        """
        # Normalize email
        email = email.lower().strip()
        
        # Load user database
        user_db = self._load_user_db()
        
        # Check if user exists
        if email not in user_db:
            return None
        
        # Get user record
        user = user_db[email]
        
        # Hash provided password with stored salt
        password_hash, _ = self._hash_password(password, user["salt"])
        
        # Check if password matches
        if password_hash != user["password_hash"]:
            return None
        
        # Update last login time
        user_db[email]["last_login"] = int(time.time())
        self._save_user_db(user_db)
        
        return email
    
    def create_session(self, user_id: str) -> str:
        """
        Create a new session for a user
        
        Args:
            user_id: The user's ID (email)
            
        Returns:
            Session ID token
        """
        # Generate session ID
        session_id = secrets.token_hex(32)
        
        # Load session database
        session_db = self._load_session_db()
        
        # Create session record
        session_db[session_id] = {
            "user_id": user_id,
            "created_at": int(time.time()),
            "last_seen": int(time.time())
        }
        
        # Save session database
        self._save_session_db(session_db)
        
        return session_id
    
    def validate_session(self, session_id: str) -> Optional[str]:
        """
        Validate a session
        
        Args:
            session_id: The session ID to validate
            
        Returns:
            User ID if session is valid, None otherwise
        """
        # Load session database
        session_db = self._load_session_db()
        
        # Check if session exists
        if session_id not in session_db:
            return None
        
        # Get session record
        session = session_db[session_id]
        
        # Update last seen time
        session["last_seen"] = int(time.time())
        self._save_session_db(session_db)
        
        return session["user_id"]
    
    def invalidate_session(self, session_id: str) -> None:
        """
        Invalidate a session
        
        Args:
            session_id: The session ID to invalidate
        """
        # Load session database
        session_db = self._load_session_db()
        
        # Remove session if it exists
        if session_id in session_db:
            del session_db[session_id]
            self._save_session_db(session_db)