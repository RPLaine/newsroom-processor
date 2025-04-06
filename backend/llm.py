import asyncio
import requests

async def generate_llm_response(prompt, max_length=500, temperature=1.0, top_k=50, top_p=0.9, repetition_penalty=1.0):
    payload = {
        "prompt": prompt,
        "max_length": max_length,
        "temperature": temperature,
        "top_k": top_k,
        "top_p": top_p,
        "repetition_penalty": repetition_penalty
    }
    url = "https://www.northbeach.fi/dolphin"

    response = await asyncio.to_thread(
        requests.post,
        url,
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    value = response.text

    if "<|im_start|>assistant" in value:
        answer = value.split("<|im_start|>assistant", 1)[-1]
    if "<|im_end|>" in answer:
        answer = answer.split("<|im_end|>")[0]
        
    return answer