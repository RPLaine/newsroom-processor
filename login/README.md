# GameGen2 Authentication Module

This directory contains the authentication system for GameGen2.

## Components

- `__init__.py`: Module initialization and package exports
- `auth_handler.py`: HTTP authentication handler for login, registration, and session management
- `auth_routes.py`: API route handlers for authentication endpoints
- `user_manager.py`: User account and session data management

## Authentication Flow

1. Users register or login through the web interface
2. Credentials are validated against user database
3. Sessions are created and stored in the sessions database
4. Authentication cookies track user sessions

## Security Features

- Passwords are hashed with SHA-256 + unique salt
- HTTP-only cookies prevent JavaScript access
- Sessions have configurable timeouts
- Automatic session validation on each request

## API Endpoints

- `/api/login`: Authenticates users with email and password
- `/api/register`: Creates new user accounts
- `/api/logout`: Terminates user sessions
- `/api/check-auth`: Verifies authentication status