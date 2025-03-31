import requests

url = "http://localhost:8001/test"
payload = {
    "message": "Hello, World!",
    "user_id": 12345,
}
headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print("Status Code:", response.status_code)
print("Response Body:", response.json())