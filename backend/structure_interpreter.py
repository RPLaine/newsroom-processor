import os
import json
import time
from uuid import uuid4
from backend.file_handler import load_user_data, get_user_data_file_path, ensure_directory, save_data, load_data
def create_job(user_id, job_id, job_data):
    job_dir = os.path.join("data", "users", user_id, "jobs", job_id)
    ensure_directory(job_dir)
    job_data_path = os.path.join(job_dir, "data.json")
    save_data(job_data_path, job_data)
    return True

def check_for_saved_structures(user_id):
    saved_structures_path = os.path.join("data", "users", user_id, "saved_structures.json")
    if os.path.exists(saved_structures_path):
        return saved_structures_path
    return None

def load_structures(file_path):
    structures = load_data(file_path)
    if not structures or "nodes" not in structures or "connections" not in structures:
        return None, None
    return structures.get("nodes", []), structures.get("connections", [])

def create_workflow_job(user_id, nodes, connections, job_name="Automated Workflow"):
    job_id = str(uuid4())
    timestamp = time.time()

    new_job = {
        "id": job_id,
        "name": job_name,
        "created_at": timestamp,
        "description": "Automatically created from saved structures",
        "inputs": [],
        "outputs": [],
        "conversation": [],
        "auto_generated": True
    }

    user_data = load_user_data(user_id)
    if "jobs" not in user_data:
        user_data["jobs"] = []

    user_data["jobs"].append(new_job)
    user_data_path = get_user_data_file_path(user_id)
    save_data(user_data_path, user_data)
    create_job(user_id, job_id, new_job)
    return job_id

def create_step_folders(user_id, job_id, nodes):
    job_folder = os.path.join("data", "users", user_id, "jobs", job_id)
    node_steps = {}
    
    for i, node in enumerate(nodes):
        node_id = node.get("id")
        if not node_id:
            continue
        
        step_name = f"step_{i+1}_{node.get('type', 'process')}"
        step_folder = os.path.join(job_folder, step_name)
        os.makedirs(step_folder, exist_ok=True)
        
        step_data = {
            "node_id": node_id,
            "type": node.get("type", "process"),
            "name": node.get("name", f"Step {i+1}"),
            "data": node.get("data", {}),
            "position": i + 1
        }
        
        step_file = os.path.join(step_folder, "data.json")
        with open(step_file, "w") as f:
            json.dump(step_data, f, indent=4)
        
        node_steps[node_id] = {
            "folder": step_folder,
            "name": step_name,
            "data": step_data
        }
    
    return node_steps

def connect_steps(connections, node_steps):
    for conn in connections:
        source = conn.get("source")
        target = conn.get("target")
        
        if not source or not target or source not in node_steps or target not in node_steps:
            continue
            
        source_step = node_steps[source]
        target_step = node_steps[target]
        
        input_data = {
            "source_node": source,
            "source_step": source_step["name"],
            "content_path": os.path.join(source_step["folder"], "output.json"),
            "auto_connected": True
        }
        
        input_file = os.path.join(target_step["folder"], "input.json")
        with open(input_file, "w") as f:
            json.dump(input_data, f, indent=4)
    
    return True

def update_job_data(user_id, job_id, node_steps):
    job_data_path = os.path.join("data", "users", user_id, "jobs", job_id, "data.json")
    job_data = load_data(job_data_path) or {}
    job_data["steps"] = [node_steps[node_id]["data"] for node_id in node_steps]
    save_data(job_data_path, job_data)
    return True

def create_job_from_saved_structures(user_id, job_name="Automated Workflow"):
    structures_path = check_for_saved_structures(user_id)
    if not structures_path:
        return None

    nodes, connections = load_structures(structures_path)
    if not nodes or not connections:
        return None

    job_id = create_workflow_job(user_id, nodes, connections, job_name)
    if not job_id:
        return None

    node_steps = create_step_folders(user_id, job_id, nodes)
    connect_steps(user_id, job_id, connections, node_steps)
    update_job_data(user_id, job_id, node_steps)
    return job_id