# gamegen2

## Simple HTTP File Server

This project includes a simple HTTP server that serves only HTML, JavaScript, and CSS files on localhost:8001.

### Features
- Serves only files with .html, .js, and .css extensions
- Automatically serves index.html when accessing the root URL
- Returns 403 Forbidden for any other file types
- Uses only built-in Python libraries

### Usage

1. Run the server:
```
python main.py
```

2. Access the server at [http://localhost:8001](http://localhost:8001)

3. Place your HTML, JavaScript, and CSS files in the same directory as the main.py file

4. Press Ctrl+C in the terminal to stop the server

### Security Note
This server is intended for development purposes only and should not be used in production environments.

