"""
LLM integration module for Dolphin and other language models
"""
import json
import requests

def send_to_dolphin_llm(message, system_message="", model="dolphin-mixtral:latest"):
    """
    Send a message to the Dolphin LLM API
    
    Args:
        message: The user message to send
        system_message: Optional system message for context
        model: The model to use for inference
        
    Returns:
        The response from the LLM
    """
    # Implementation for LLM API calls
    try:
        # Add actual API call implementation here
        response = {"response": "LLM response would go here"}
        return response
    except Exception as e:
        return {"error": str(e)}

def generate_prompt(messages, max_length=500, temperature=1.0, top_k=50, top_p=0.9, repetition_penalty=1.0):
    """
    Generate a prompt for the Dolphin 3.0 LLM using the <|im_start|> messaging format.

    Args:
        messages (list of dict): A list of messages where each message is a dictionary
                                with 'role' and 'content' keys.
        max_length (int): Maximum length of generated text.
        temperature (float): Sampling temperature.
        top_k (int): Number of highest probability tokens to keep.
        top_p (float): Nucleus sampling parameter.
        repetition_penalty (float): Penalty for token repetition.

    Returns:
        dict: The response from the Dolphin 3.0 LLM.
    """
    formatted_messages = "".join(
        f"<|im_start|>user\n{message['content']}<|im_end|>\n<|im_start|>assistant\n"
        for message in messages
    )

    payload = {
        "prompt": formatted_messages,
        "max_length": max_length,
        "temperature": temperature,
        "top_k": top_k,
        "top_p": top_p,
        "repetition_penalty": repetition_penalty
    }
    url = "https://www.northbeach.fi/dolphin"

    print("🐬 Sending request to Dolphin LLM...")

    try:
        # Ensure proper encoding for the request
        response = requests.post(
            url, 
            json=payload, 
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        
        # Get response and set encoding to UTF-8 explicitly
        response.encoding = 'utf-8'
        response_text = response.text
        
        print("Raw response:", response_text)
        
        # Extract the assistant's response after the last occurrence of the marker
        answer = response_text.rsplit("<|im_start|>assistant\n", 1)[-1]
        
        # Clean up any remaining markers if present
        if "<|im_end|>" in answer:
            answer = answer.split("<|im_end|>")[0]
            
        print("Processed answer:", answer)
        print("🐬 Response received successfully.")
        return answer
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Dolphin 3.0 LLM: {e}")
        return None