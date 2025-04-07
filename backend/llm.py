import requests

def generate_llm_response(prompt, max_length=500, temperature=1.0, top_k=50, top_p=0.9, repetition_penalty=1.0):  
    payload = {
        "prompt": prompt,
        "max_length": max_length,
        "temperature": temperature,
        "top_k": top_k,
        "top_p": top_p,
        "repetition_penalty": repetition_penalty,
        "stream": False
    }
    url = "https://www.northbeach.fi/dolphin"

    try:
        response = requests.post(
            url,
            json=payload,
            headers={"Accept": "application/json"}
        )
        
        response.raise_for_status()
        return response

    except requests.exceptions.ConnectionError:
        return {"status": "error", "message": "Could not connect to the LLM server"}
    except requests.exceptions.HTTPError as e:
        return {"status": "error", "message": f"HTTP Error: {e}"}
    except Exception as e:
        return {"status": "error", "message": f"Error: {e}"}
    
# create a test response to test the LLM
# use main function to test the LLM

if __name__ == "__main__":
    request = "Tell me a joke about a cat."
    response = generate_llm_response(request)
    print(response.text)