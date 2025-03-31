# GameGen2 Architecture

This document outlines the architecture and file organization for the GameGen2 project. Following these guidelines will help maintain consistency and clarity in the codebase.

## Project Structure Overview

The project is organized into the following main directories:

```
gamegen2/
├── main.py              # Main entry point for the application
├── README.md            # Project overview and general information
├── server/              # Server-side Python code
├── client/              # Client-side web assets (HTML, CSS, JS)
├── data/                # Data storage (JSON files)
└── documents/           # Project documentation
```

## Server Structure (`server/`)

The `server/` directory contains all server-side Python code except for `main.py` which serves as the application entry point.

### Core Server Components

The server architecture is composed of these key components:

1. **Main Server (`server.py`)**: 
   - Core HTTP server implementation
   - Manages server lifecycle (initialization, startup, shutdown)
   - Configures server settings (port, data directory, debug mode)
   - Routes requests to appropriate handlers

2. **Request Handlers**:
   - **Request Handler (`request_handler.py`)**: Base handler for all HTTP requests
     - Routes and processes both GET and POST requests
     - Responsible for serving static files and client resources
   
   - **POST Handler (`post_handler.py`)**: 
     - Processes all HTTP POST requests through a single unified endpoint
     - JSON payload structure in the request body determines the action
     - Action field in JSON defines the operation type (login, create, update, etc.)
     - All responses are returned in a standardized JSON format

3. **Data Management**:
   - **JSON Database Handler (`json_db.py`)**: 
     - Handles all JSON file operations (read/write)
     - Implements atomic write operations for data integrity
     - Provides transaction support for complex operations
     - Handles error recovery and data backup
   
   - **Dictionary Handler (`dict_handler.py`)**: 
     - Manages in-memory data structures
     - Converts between JSON and Python dictionary objects
     - Performs data validation and type checking
     - Provides memory-efficient data access patterns

4. **AI Integration**:
   - **LLM Request Handler (`ai/llm_handler.py`)**: 
     - Manages communication with Language Learning Models (LLMs)
     - Formats prompt templates for different AI services
     - Processes AI responses for application use
     - Handles rate limiting and API usage optimization
     - Provides fallback mechanisms for service interruptions

### Organization Guidelines

- `__init__.py`: Makes the directory a proper Python package
- `server.py`: Core server implementation (HTTP server and request handling)
- `request_handler.py`: Base request handler implementation for all HTTP requests
- `post_handler.py`: JSON-based unified POST request handler
- `json_db.py`: JSON file database operations
- `dict_handler.py`: Dictionary data structure operations
- **Modules**: Server functionality should be further organized into subpackages:
  - `authentication/`: User authentication and session management
  - `ai/`: AI and LLM integration components

### Updated Module Structure

```
server/
├── __init__.py
├── server.py               # Main server implementation
├── request_handler.py      # Base request handling
├── post_handler.py         # Unified POST request processing
├── json_db.py              # JSON database operations
├── dict_handler.py         # Dictionary data handling
├── authentication/
│   ├── __init__.py
│   ├── auth_handler.py     # Authentication request handling
│   ├── auth_routes.py      # Authentication endpoints
│   └── user_manager.py     # User account management
└── ai/
    ├── __init__.py
    ├── llm_handler.py      # LLM request handling
    ├── prompt_templates.py # Prompt formatting templates
    ├── response_parser.py  # AI response processing
    └── service_manager.py  # AI service integration
```

### Component Interactions

```
┌───────────────┐      ┌────────────────┐      ┌────────────────┐
│               │      │                │      │                │
│  Main Server  │─────▶│Request Handler │─────▶│ Dict Handler   │
│               │      │                │      │                │
└───────────────┘      └────────────────┘      └────────────────┘
                              │                        │
                              │                        │
                              ▼                        ▼
                      ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
                      │                │      │                │      │                │
                      │  POST Handler  │─────▶│ JSON DB Writer │◄─────│ LLM Handler    │
                      │ (Single JSON   │      │                │      │                │
                      │  Endpoint)     │      └────────────────┘      └────────────────┘
                      │                │                                      ▲
                      └────────────────┘                                      │
                              │                                               │
                              └───────────────────────────────────────────────┘
```

### POST Request Flow

All POST requests follow a unified pattern:

1. Client sends a POST request to the server's unified endpoint
2. The request body contains a JSON payload with:
   ```json
   {
     "action": "action_name",
     "data": {
       // Action-specific payload
     }
   }
   ```
3. The POST handler processes the request based on the `action` field
4. Response is returned in a standardized JSON format:
   ```json
   {
     "status": "success|error",
     "data": {
       // Response payload
     },
     "message": "Optional status message"
   }
   ```

## Client Structure (`client/`)

The `client/` directory contains all front-end assets including HTML, CSS, JavaScript, and static resources.

### Client Loading Flow

The client follows a modular loading pattern based on user authentication status:

1. **Entry Point**: `index.html` is the entry point for all users
2. **Core Loading**: `main.js` is loaded first and handles module loading decisions
3. **Authentication Check**: The server checks for valid UID in the cookie
4. **Module Loading**:
   - If user is **not authenticated**: The "login" module is loaded
   - If user is **authenticated**: The "app" module is loaded
   - The "styling" module is loaded in all cases to ensure consistent UX

```
┌───────────┐     ┌──────────┐     ┌───────────────────┐
│           │     │          │     │                   │
│ index.html├────▶│ main.js  │────▶│ Auth Check (UID)  │
│           │     │          │     │                   │
└───────────┘     └──────────┘     └─────────┬─────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
                  ┌────▼─────┐                               ┌─────▼────┐
                  │          │                               │          │
                  │ Logged In│                               │ Not Auth │
                  │          │                               │          │
                  └────┬─────┘                               └─────┬────┘
                       │                                           │
                  ┌────▼─────┐                               ┌─────▼────┐
                  │          │                               │          │
                  │   App    │                               │  Login   │
                  │  Module  │                               │  Module  │
                  │          │                               │          │
                  └──────────┘                               └──────────┘
                       
                  ┌──────────────────────────────────────────────────────┐
                  │                                                      │
                  │                   Styling Module                     │
                  │                                                      │
                  └──────────────────────────────────────────────────────┘
```

### Module Components

#### Login Module
The login module provides user authentication functionality through two main components:

1. **Login Component**: User authentication for existing accounts
   - Credential validation
   - Session management
   - Error handling

2. **Registration Component**: New user account creation
   - Form validation
   - Account creation
   - Initial profile setup

#### App Module
The app module provides the core application functionality through six main components:

1. **Continue Story**: Resume work on the current story
   - Loads most recent story state
   - Provides context and continuation options

2. **New Story**: Start creating a new story
   - Story initialization
   - Setting selection
   - Character creation

3. **Save Story**: Persist current story to the server
   - Local state serialization
   - Server synchronization
   - Backup management

4. **Load Story**: Retrieve a previously saved story
   - Story listing and selection
   - State restoration
   - Version management

5. **Settings**: User preference management
   - Account settings
   - Application preferences
   - Theme selection

6. **Logout**: End the current user session
   - Session termination
   - State cleanup
   - Redirect to login

#### Styling Module
The styling module is loaded in all cases to ensure consistent user experience:

- Manages theme application
- Handles animations and transitions
- Ensures responsive layout
- Provides accessibility features

### Organization Guidelines

- `index.html`: Main entry point for the client-side application
- `main.js`: Primary JavaScript file that handles module loading
- `app/`: Contains application components for authenticated users
- `login/`: Contains authentication components for non-authenticated users
- `styling/`: Contains styles and theme management for all modules

### Updated Client Structure

```
client/
├── index.html             # Main entry point
├── main.js               # Core module loader
├── favicon.svg           # Site favicon
├── app/                  # App module (authenticated users)
│   └── storytelling.js   # Storytelling functionality
├── login/                # Login module (non-authenticated users)
│   ├── login.html        # Login page structure
│   ├── login-content.html # Login content template
│   ├── login.js          # Login functionality
│   ├── login.css         # Login-specific styles
│   └── webgpu-background.js # Login background effects
└── styling/              # Styling module (all users)
    ├── main.css          # Core styles
    ├── variables.css     # CSS variables
    ├── animations.css    # Animation definitions
    ├── app.css           # App-specific styles
    ├── storytelling.css  # Storytelling-specific styles
    ├── styling.js        # Dynamic styling functionality
    └── theme.json        # Theme definitions
```

## Data Structure (`data/`)

The `data/` directory contains all persistent data stored in JSON files. The application uses a JSON-based database as specified in the development guidelines.

### Organization Guidelines

- `users.json`: User account information
- `sessions.json`: Active session data
- `user_data.json`: User-specific application data
- Additional JSON files should follow a clear naming convention

### Security Note

As noted in the data README, these files are automatically created and managed by the authentication system. They should not be manually edited while the application is running to avoid data corruption or security issues.

## Documentation Structure (`documents/`)

The `documents/` directory contains all project documentation.

### Organization Guidelines

- `architecture.md`: This document - describes project structure
- `development.md`: Development roadmap and guidelines
- `styling.md`: Style guide and visual design documentation
- Additional documentation should be added here with descriptive names

## Design Principles

1. **Separation of Concerns**: Server-side code (Python) and client-side code (HTML/JS/CSS) are kept separate
2. **Modularity**: Code is organized into logical modules based on functionality
3. **Feature-based Organization**: Components are grouped by feature rather than by file type
4. **Clear Naming**: File and directory names clearly indicate their purpose and content

## Development Guidelines

For additional development guidelines and project roadmap, please refer to the `documents/development.md` file.

## HTTPS Note

As specified in the development document, this project does not handle HTTPS directly. It is assumed that the main server or reverse proxy managing access to this project is responsible for HTTPS enforcement.