import requests

url = "http://127.0.0.1:8001"
payload = {
    "message": "Hello, World!",
    "user_id": 123,
}
headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print("Status Code:", response.status_code)
print("Response Body:", response.json())