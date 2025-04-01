import requests

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
        f"<|im_start|>{message['role']}\n{message['content']}<|im_end|>\n"
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
        response = requests.post(url, json=payload, headers={"Accept": "application/json"})
        response.raise_for_status()
        print(response.text)
        print("🐬 Response received successfully.")
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Dolphin 3.0 LLM: {e}")
        return None