"""
Structure Interpreter Module

This module handles the interpretation of saved_structures.json files and
automatically creates job workflows based on node connections.
"""
import os
import json
import time
from uuid import uuid4
from backend.common_utils import load_user_data, get_user_data_file_path, read_json_file, write_json_file
from backend.utils.file_utils import ensure_directory, save_data

def create_job(user_id, job_id, job_data):
    """
    Create job directory and save job data
    
    Args:
        user_id: The user ID
        job_id: The job ID
        job_data: Job data dictionary
        
    Returns:
        True if successful, False on error
    """
    job_dir = os.path.join("data", "users", user_id, "jobs", job_id)
    
    # Ensure job directory exists
    if not ensure_directory(job_dir):
        return False
        
    # Save job data
    job_data_path = os.path.join(job_dir, "data.json")
    if not save_data(job_data_path, job_data):
        return False
        
    return True

def check_for_saved_structures(user_id):
    """
    Check if a user has a saved_structures.json file
    
    Args:
        user_id: The user ID
        
    Returns:
        Path to the file if it exists, None otherwise
    """
    saved_structures_path = os.path.join("data", "users", user_id, "saved_structures.json")
    if os.path.exists(saved_structures_path):
        return saved_structures_path
    return None

def load_structures(file_path):
    """
    Load and validate structures from a saved_structures.json file
    
    Args:
        file_path: Path to the saved_structures.json file
        
    Returns:
        Tuple of (nodes, connections) or (None, None) if invalid
    """
    structures = read_json_file(file_path)
    if not structures or "nodes" not in structures or "connections" not in structures:
        return None, None
    
    return structures.get("nodes", []), structures.get("connections", [])

def create_workflow_job(user_id, nodes, connections, job_name="Automated Workflow"):
    """
    Create a new job based on node connections
    
    Args:
        user_id: The user ID
        nodes: List of node objects
        connections: List of connection objects
        job_name: Name for the new job
        
    Returns:
        Job ID if job was created, None on error
    """
    # Generate job ID and timestamp
    job_id = str(uuid4())
    timestamp = time.time()
    
    # Create job object
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
    
    # Load user data
    user_data = load_user_data(user_id)
    if "jobs" not in user_data:
        user_data["jobs"] = []
    
    # Add job to user data
    user_data["jobs"].append(new_job)
    
    # Save updated user data
    user_data_path = get_user_data_file_path(user_id)
    if not write_json_file(user_data_path, user_data):
        return None
    
    # Create job folder
    create_job(user_id, job_id, new_job)
    
    return job_id

def create_step_folders(user_id, job_id, nodes):
    """
    Create step folders for each node in a job
    
    Args:
        user_id: The user ID
        job_id: The job ID
        nodes: List of node objects
        
    Returns:
        Dictionary mapping node IDs to step information
    """
    job_folder = os.path.join("data", "users", user_id, "jobs", job_id)
    
    # Map to keep track of node IDs and their corresponding step folders
    node_steps = {}
    
    for i, node in enumerate(nodes):
        node_id = node.get("id")
        if not node_id:
            continue
            
        # Create step folder
        step_name = f"step_{i+1}_{node.get('type', 'process')}"
        step_folder = os.path.join(job_folder, step_name)
        os.makedirs(step_folder, exist_ok=True)
        
        # Save node data to step folder
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
            
        # Add to mapping
        node_steps[node_id] = {
            "folder": step_folder,
            "name": step_name,
            "data": step_data
        }
    
    return node_steps

def connect_steps(user_id, job_id, connections, node_steps):
    """
    Connect steps based on connections between nodes
    
    Args:
        user_id: The user ID
        job_id: The job ID
        connections: List of connection objects
        node_steps: Dictionary mapping node IDs to step information
        
    Returns:
        True if successful, False on error
    """
    for conn in connections:
        source = conn.get("source")
        target = conn.get("target")
        
        if not source or not target or source not in node_steps or target not in node_steps:
            continue
            
        # Add source as input to target
        source_step = node_steps[source]
        target_step = node_steps[target]
        
        # Create input.json in target folder referencing the source
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
    """
    Update job data.json with step information
    
    Args:
        user_id: The user ID
        job_id: The job ID
        node_steps: Dictionary mapping node IDs to step information
        
    Returns:
        True if successful, False on error
    """
    job_data_path = os.path.join("data", "users", user_id, "jobs", job_id, "data.json")
    job_data = read_json_file(job_data_path) or {}
    job_data["steps"] = [node_steps[node_id]["data"] for node_id in node_steps]
    return write_json_file(job_data_path, job_data)

def create_job_from_saved_structures(user_id, job_name="Automated Workflow"):
    """
    Check if a user has a saved_structures.json file and automatically
    create a job based on the node connections
    
    Args:
        user_id: The user ID
        job_name: Name for the new job
        
    Returns:
        Job ID if job was created, None otherwise
    """
    # Check if saved_structures.json exists
    structures_path = check_for_saved_structures(user_id)
    if not structures_path:
        return None
        
    # Load the saved structures
    nodes, connections = load_structures(structures_path)
    if not nodes or not connections:
        return None
        
    # Create the job
    job_id = create_workflow_job(user_id, nodes, connections, job_name)
    if not job_id:
        return None
    
    # Create step folders for each node
    node_steps = create_step_folders(user_id, job_id, nodes)
    
    # Connect steps based on connections
    connect_steps(user_id, job_id, connections, node_steps)
    
    # Update job data with steps information
    update_job_data(user_id, job_id, node_steps)
    
    return job_id