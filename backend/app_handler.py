import json
import os
from uuid import uuid4

def handle_app_actions(response, cookie, config):
    """
    Route application actions to the appropriate handler
    
    Args:
        response: Response object containing request data
        cookie: Cookie object for session management
        config: Server configuration
        
    Returns:
        Updated response object
    """
    action = response["request"]["action"]
    user_id = response.get("userid")
    request_data = response["request"]
    
    if action == "create_story":
        return handle_create_story(response, user_id, request_data)
    elif action == "continue_story":
        return handle_continue_story(response, user_id, request_data)
    elif action == "get_stories":
        return handle_get_stories(response, user_id)
    elif action == "delete_story":
        return handle_delete_story(response, user_id, request_data)
    elif action == "application_init":
        # Just return the current response for init action
        response["status"] = "success"
        return response
    else:
        response["status"] = "error"
        response["message"] = f"Unknown application action: {action}"
        return response

def handle_create_story(response, user_id, request_data):
    """
    Handle story creation request
    
    Args:
        response: The response dictionary
        user_id: The user ID
        request_data: The request data containing story details
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Extract story data from request
        prompt = request_data.get("prompt", "")
        genre = request_data.get("genre", "fantasy")
        
        if not prompt:
            response["status"] = "error"
            response["message"] = "Story prompt is required"
            return response
            
        # Generate a simple story based on prompt and genre
        generated_story = generate_story_start(prompt, genre)
        
        # Create story data structure
        story_id = str(uuid4())
        story_data = {
            "id": story_id,
            "title": f"{genre.capitalize()} Story",
            "genre": genre,
            "content": generated_story,
            "created_at": int(__import__("time").time()),
            "last_modified": int(__import__("time").time())
        }
        
        # Save story to user data
        user_data_path = os.path.join("data", "users", user_id, "data.json")
        
        if os.path.exists(user_data_path):
            # Load existing user data
            with open(user_data_path, 'r') as f:
                user_data = json.load(f)
                
            # Add story to user's stories
            if "stories" not in user_data:
                user_data["stories"] = []
                
            user_data["stories"].append(story_data)
            
            # Save updated user data
            with open(user_data_path, 'w') as f:
                json.dump(user_data, f, indent=2)
                
            # Set response
            response["status"] = "success"
            response["message"] = "Story created successfully"
            response["data"] = {"story": story_data}
        else:
            response["status"] = "error"
            response["message"] = "User data not found"
            
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to create story: {str(e)}"
        return response

def handle_continue_story(response, user_id, request_data):
    """
    Handle story continuation request
    
    Args:
        response: The response dictionary
        user_id: The user ID
        request_data: The request data containing continuation details
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Extract continuation data
        story_id = request_data.get("story_id")
        user_input = request_data.get("user_input", "")
        
        if not story_id:
            response["status"] = "error"
            response["message"] = "Story ID is required"
            return response
            
        if not user_input:
            response["status"] = "error"
            response["message"] = "User input is required"
            return response
            
        # Load user data
        user_data_path = os.path.join("data", "users", user_id, "data.json")
        
        if not os.path.exists(user_data_path):
            response["status"] = "error"
            response["message"] = "User data not found"
            return response
            
        with open(user_data_path, 'r') as f:
            user_data = json.load(f)
            
        # Find the story by ID
        story = None
        story_index = -1
        
        for i, s in enumerate(user_data.get("stories", [])):
            if s["id"] == story_id:
                story = s
                story_index = i
                break
                
        if not story:
            response["status"] = "error"
            response["message"] = "Story not found"
            return response
            
        # Generate continuation based on user input and existing content
        continuation = generate_story_continuation(story["content"], user_input)
        
        # Update story content
        updated_content = f"{story['content']}\n\n{user_input}\n\n{continuation}"
        user_data["stories"][story_index]["content"] = updated_content
        user_data["stories"][story_index]["last_modified"] = int(__import__("time").time())
        
        # Save updated user data
        with open(user_data_path, 'w') as f:
            json.dump(user_data, f, indent=2)
            
        # Set response
        response["status"] = "success"
        response["message"] = "Story continued successfully"
        response["data"] = {
            "story": user_data["stories"][story_index]
        }
        
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to continue story: {str(e)}"
        return response

def handle_get_stories(response, user_id):
    """
    Handle request to get user's stories
    
    Args:
        response: The response dictionary
        user_id: The user ID
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Load user data
        user_data_path = os.path.join("data", "users", user_id, "data.json")
        
        if not os.path.exists(user_data_path):
            response["status"] = "error"
            response["message"] = "User data not found"
            return response
            
        with open(user_data_path, 'r') as f:
            user_data = json.load(f)
            
        # Set response
        response["status"] = "success"
        response["message"] = "Stories retrieved successfully"
        response["data"] = {
            "stories": user_data.get("stories", [])
        }
        
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to get stories: {str(e)}"
        return response

def handle_delete_story(response, user_id, request_data):
    """
    Handle story deletion request
    
    Args:
        response: The response dictionary
        user_id: The user ID
        request_data: The request data containing story ID
        
    Returns:
        Updated response dictionary
    """
    try:
        if not user_id:
            response["status"] = "error"
            response["message"] = "Authentication required"
            return response
            
        # Extract story ID
        story_id = request_data.get("story_id")
        
        if not story_id:
            response["status"] = "error"
            response["message"] = "Story ID is required"
            return response
            
        # Load user data
        user_data_path = os.path.join("data", "users", user_id, "data.json")
        
        if not os.path.exists(user_data_path):
            response["status"] = "error"
            response["message"] = "User data not found"
            return response
            
        with open(user_data_path, 'r') as f:
            user_data = json.load(f)
            
        # Find and remove the story
        stories = user_data.get("stories", [])
        found = False
        
        for i, story in enumerate(stories):
            if story["id"] == story_id:
                del stories[i]
                found = True
                break
                
        if not found:
            response["status"] = "error"
            response["message"] = "Story not found"
            return response
            
        # Update user data
        user_data["stories"] = stories
        
        # Save updated user data
        with open(user_data_path, 'w') as f:
            json.dump(user_data, f, indent=2)
            
        # Set response
        response["status"] = "success"
        response["message"] = "Story deleted successfully"
        
        return response
    except Exception as e:
        response["status"] = "error"
        response["message"] = f"Failed to delete story: {str(e)}"
        return response

def generate_story_start(prompt, genre):
    """
    Generate a simple story start based on the prompt and genre
    This is a simplified placeholder for a real AI-based story generator
    
    Args:
        prompt: The user's prompt for the story
        genre: The genre of the story
        
    Returns:
        A generated story start
    """
    genre_intros = {
        "fantasy": "In a realm where magic flowed like rivers through ancient forests, ",
        "sci-fi": "Among the gleaming spires of a city that pierced the clouds, in a future beyond imagination, ",
        "mystery": "The fog rolled in unusually thick that evening, obscuring the old mansion on the hill where ",
        "horror": "The shadows seemed to move of their own accord in the abandoned building, and a chill ran down the spine of ",
        "adventure": "The map was weathered and torn at the edges, but it clearly marked the location of the treasure that "
    }
    
    intro = genre_intros.get(genre, "Once upon a time, ")
    
    # Simple prompt integration
    return f"{intro}{prompt} As the story began to unfold, no one could have predicted the extraordinary events that would follow."

def generate_story_continuation(current_content, user_input):
    """
    Generate a continuation of the story based on the current content and user input
    This is a simplified placeholder for a real AI-based continuation generator
    
    Args:
        current_content: The current story content
        user_input: The user's input for what happens next
        
    Returns:
        A generated continuation
    """
    continuations = [
        "Events took an unexpected turn as the implications of these actions rippled through the narrative.",
        "In that moment, everything changed, setting in motion a chain of events that would reverberate through time.",
        "Little did they know that this decision would alter the course of their journey in profound ways.",
        "The atmosphere shifted subtly, as if the world itself recognized the significance of what had just occurred.",
        "As this unfolded, a sense of destiny hung in the air, whispering of adventures yet to come."
    ]
    
    import random
    return random.choice(continuations)