import requests

def generate_prompt(messages):
    """
    Generate a prompt for the Dolphin 3.0 LLM using the <|im_start|> messaging format.

    Args:
        messages (list of dict): A list of messages where each message is a dictionary
                                with 'role' and 'content' keys.

    Returns:
        str: The response from the Dolphin 3.0 LLM.
    """
    formatted_messages = "".join(
        f"<|im_start|>{message['role']}\n{message['content']}<|im_end|>\n"
        for message in messages
    )

    payload = {"prompt": formatted_messages}
    url = "https://www.northbeach.fi/dolphin"

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Dolphin 3.0 LLM: {e}")
        return None