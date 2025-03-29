# GameGen2

## Interactive Text-Based Story Game Engine

GameGen2 is an interactive text-based storytelling platform that leverages the Dolphin 3 LLM to create dynamic, personalized narrative experiences for users.

### Features

- **Dynamic Storytelling**: Interactive text-based adventures powered by Dolphin 3 LLM acting as storyteller and game master
- **User-Specific Storylines**: Personalized gaming experiences tailored to each user
- **Cookie-Based Authentication**: Secure user sessions and saved progress
- **JSON Database**: Lightweight data storage for user profiles and story progress
- **Simple Web Interface**: Clean, responsive UI for interacting with the story
- **Server-Side Architecture**: Uses only built-in Python modules for maximum compatibility

### Technical Details

- Connects to Dolphin 3 LLM via https://www.northbeach.fi/dolphin API
- Utilizes im-format (`<|im_start|>`) for structured communication with the LLM
- Sends JSON requests with "prompt" key for story generation
- Built on a lightweight HTTP server (localhost:8001)
- Serves HTML, JavaScript, CSS, and SVG files

### Usage

1. Run the server:
```
python main.py
```

2. Access the game at [http://localhost:8001](http://localhost:8001)

3. Create an account or log in to continue your adventure

4. Press Ctrl+C in the terminal to stop the server

### Requirements

- Python 3.6+
- Internet connection (for API access to Dolphin 3 LLM)
- Modern web browser

### Security Note

This application includes authentication mechanisms but is primarily intended for personal use. Exercise caution when deploying in shared environments.

### Dolphin 3 LLM API Usage

The Dolphin 3 LLM API is used to generate dynamic story content. To interact with the API, send a POST request to the endpoint `https://www.northbeach.fi/dolphin` with a JSON payload containing the `prompt` key. Below is an example:

```json
{
  "prompt": "Once upon a time in a distant galaxy..."
}
```

The API will respond with a JSON object containing the generated story content. Ensure you have an active internet connection to access the API.

### HTTPS Note
This project does not handle HTTPS directly. It is assumed that the main server or reverse proxy managing access to this project is responsible for HTTPS enforcement. All requests to this project are expected to be redirected from the main server.

