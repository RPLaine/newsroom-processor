# Newsroom Processor

An AI-powered content generation and processing platform with a modern web interface.

## Overview

Newsroom Processor is a full-stack application that allows users to process content through configurable AI workflows. It features a structure-based approach where nodes and connections define how content flows through different processing steps. The application includes a sleek web interface with animations, authentication, and real-time processing of content.

## System Architecture

The application consists of three main components:

### 1. Backend (Python)

The server-side components handle:
- User authentication and session management
- Content processing workflows
- File management
- Communication with LLM models
- Structure interpretation and execution
- API endpoints for frontend operations

### 2. Frontend (JavaScript)

The client-side interface features:
- Responsive single-page application design
- Interactive login screen with advanced animations
- Structure visualization and manipulation
- Input configuration
- Process execution and monitoring
- Output file viewing and management

### 3. Data Storage

The system uses a file-based data storage approach with:
- User profiles and authentication information
- Workflow structures (JSON-based)
- Process outputs and generated files
- Configuration settings

## Features

- **User Authentication**: Secure login and registration system
- **Structure Management**: Create, select, and manage workflow structures
- **Node Processing**: Configure and execute nodes within a structure
- **Input Handling**: Support for various input types (text, files, RSS feeds, web search)
- **Output Management**: View, download, and manage generated output files
- **Responsive UI**: Modern interface with dark/light theme support
- **Visual Effects**: Smooth animations with loading indicators

## Getting Started

### Prerequisites

- Python 3.10+
- Modern web browser with JavaScript enabled
- Internet connection for external API calls

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/newsroom-processor.git
   cd newsroom-processor
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Configure the application:
   - Edit `data/config.json` for server settings
   - Update `frontend/config.js` for frontend settings

### Running the Application

1. Start the backend server:
   ```
   python main.py
   ```

2. Access the web interface:
   - Open http://127.0.0.1:8001 in your browser (or the configured port)
   - Create an account or log in with existing credentials

## Usage

### Creating a Structure

1. Navigate to the "Structures" tab
2. Select an existing structure or create a new one
3. Define nodes and connections that will process your content

### Setting Inputs

1. Go to the "Inputs" tab
2. Configure input sources for your selected nodes:
   - Text input
   - File upload
   - RSS feed
   - Web search

### Processing Content

1. Switch to the "Process" tab
2. Click "Start" to begin processing
3. Monitor the workflow execution in real-time

### Managing Outputs

1. Access the "Outputs" tab
2. View, download, or delete generated files
3. Review content processing results

## Project Structure

```
newsroom-processor/
├── backend/               # Server-side code
│   ├── application/       # Core application logic
│   ├── server.py          # HTTP server implementation
│   └── ...                # Other backend modules
├── data/                  # Data storage
│   ├── config.json        # Application configuration
│   ├── structures.json    # Workflow structures
│   ├── users.json         # User information
│   ├── johto/             # External service integration
│   └── processes/         # Process outputs and results
├── frontend/              # Client-side code
│   ├── animation/         # UI animations
│   ├── application/       # Main application interface
│   ├── login/             # Authentication interface
│   ├── main.js            # Main JavaScript entry point
│   └── ...                # Style and utility files
├── main.py                # Application entry point
└── requirements.txt       # Python dependencies
```

## Developer Notes

### Backend Development

The backend is structured as a modular Python application:
- `server.py`: HTTP server handling requests
- `login_handler.py`: User authentication
- `application_handler.py`: Core application logic
- `structure_interpreter.py`: Interpreting and executing structures

### Frontend Development

The frontend follows a component-based approach:
- `login/`: Authentication UI with animated background effects
- `application/`: Main application interface with tabbed navigation
- `components/`: Reusable UI components
- `handlers/`: Event handlers for user interactions

## Contact

riku.laine@tuni.fi