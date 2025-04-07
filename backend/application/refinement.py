import json

def refine_response(llm_response):
    value = llm_response.text.rsplit('<|im_assistant|>', 1)[-1].strip()
    value = value.rsplit('}', 1)[0] + '}' 

    try:
        value = json.loads(value)
    except json.JSONDecodeError:
        bruteforce_value = value
        while bruteforce_value.len() > 0:
            # remove one letter at a time from the end of the string
            bruteforce_value = bruteforce_value[:-1]
            try:
                value = json.loads(bruteforce_value)
                break
            except json.JSONDecodeError:
                continue

    return value