import json

from backend.server import ApplicationServer

def load_config():
    with open("data/config.json", 'r') as file:
        data = json.load(file)
    return data

if __name__ == "__main__":
    ApplicationServer.run_server(load_config())