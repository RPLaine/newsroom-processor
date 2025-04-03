import backend.file_handler as file_handler
import backend.llm as llm

import os
import uuid
import time
import random

active_processes = {}

def start_process(response):
    request = response.get('request', {})
    user_id = response.get('userid', '')
    structure_data = request.get('structure_data', {})
    
    if not user_id:
        response['status'] = 'error'
        response['message'] = 'User not authenticated'
        return response
        
    if not structure_data:
        response['status'] = 'error'
        response['message'] = 'Missing structure_data parameter'
        return response
    
    structure_id = structure_data.get('id', str(uuid.uuid4()))
    process_dir = get_process_directory(structure_id)
    
    structure_file = os.path.join(process_dir, "structure.json")
    file_handler.save_data(structure_file, structure_data)
    
    nodes = extract_nodes(structure_data)
    connections = extract_connections(structure_data)
    
    if not nodes:
        response['status'] = 'error'
        response['message'] = 'No nodes found in structure'
        return response
        
    start_node = find_start_node(nodes)
    if not start_node:
        response['status'] = 'error'
        response['message'] = 'No start node found in structure'
        return response
    
    process_id = str(uuid.uuid4())
    process_data = {
        'id': process_id,
        'structure_id': structure_id,
        'user_id': user_id,
        'status': 'running',
        'started_at': int(time.time()),
        'current_node_id': start_node['id'],
        'visited_nodes': [start_node['id']],
        'path': [{'node_id': start_node['id'], 'timestamp': int(time.time())}],
        'nodes': nodes,
        'connections': connections
    }
    
    active_processes[process_id] = process_data
    
    process_file = os.path.join(process_dir, "process.json")
    process_records = file_handler.load_data(process_file, {})
    process_records['runs'] = process_records.get('runs', [])
    process_records['runs'].append(process_data)
    process_records['last_updated'] = int(time.time())
    file_handler.save_data(process_file, process_records)
    
    response['status'] = 'success'
    response['message'] = 'Process started successfully'
    response['data'] = {
        'process_id': process_id,
        'current_node': start_node
    }
    
    return response

def execute_node(response):
    """
    Execute the current node in a process and move to the next node.
    This function is called manually from the frontend to step through nodes.
    """
    request = response.get('request', {})
    process_id = request.get('process_id', '')
    
    if not process_id:
        response['status'] = 'error'
        response['message'] = 'Missing process_id parameter'
        return response
    
    if process_id not in active_processes:
        response['status'] = 'error'
        response['message'] = 'Process not found or no longer active'
        return response
    
    process = active_processes[process_id]
    
    if process.get('status') != 'running':
        response['status'] = 'error'
        response['message'] = f"Process is not running (status: {process.get('status', 'unknown')})"
        return response
    
    current_node_id = process.get('current_node_id')
    nodes = process.get('nodes', [])
    connections = process.get('connections', [])
    
    # Check if current node is end/finish node
    current_node = None
    for node in nodes:
        if node.get('id') == current_node_id:
            current_node = node
            node_type = node.get('type', '').lower()
            node_name = node.get('name', '').lower()
            
            if node_type in ['finish', 'end'] or 'finish' in node_name or 'end' in node_name:
                process['status'] = 'completed'
                process['completed_at'] = int(time.time())
                
                update_process_file(process)
                
                response['status'] = 'success'
                response['message'] = 'Process completed'
                response['data'] = {
                    'status': 'completed',
                    'current_node': current_node,
                    'next_node': None
                }
                return response
            break
    
    # Find the next node
    next_node = find_next_node(current_node_id, nodes, connections)
    
    if not next_node:
        process['status'] = 'completed'
        process['completed_at'] = int(time.time())
        
        update_process_file(process)
        
        response['status'] = 'success'
        response['message'] = 'Process completed (no next node found)'
        response['data'] = {
            'status': 'completed',
            'current_node': current_node,
            'next_node': None
        }
        return response
    
    # Update process with next node
    process['current_node_id'] = next_node['id']
    process['visited_nodes'].append(next_node['id'])
    process['path'].append({
        'node_id': next_node['id'],
        'timestamp': int(time.time())
    })
    
    update_process_file(process)
    
    response['status'] = 'success'
    response['message'] = 'Node executed successfully'
    response['data'] = {
        'status': 'running',
        'current_node': current_node,
        'next_node': next_node
    }
    
    return response

def update_process_file(process):
    """Helper function to update the process file on disk"""
    structure_id = process.get('structure_id')
    if structure_id:
        process_dir = get_process_directory(structure_id)
        process_file = os.path.join(process_dir, "process.json")
        if os.path.exists(process_file):
            process_records = file_handler.load_data(process_file, {})
            for run in process_records.get('runs', []):
                if run.get('id') == process.get('id'):
                    run.update(process)
                    break
            process_records['last_updated'] = int(time.time())
            file_handler.save_data(process_file, process_records)

def get_process_status(request):
    response = {
        'status': 'error',
        'message': 'Invalid process status request'
    }
    
    process_id = request.get('process_id', '')
    
    if not process_id:
        response['message'] = 'Missing process_id parameter'
        return response
    
    if process_id in active_processes:
        process = active_processes[process_id]
        
        current_node_id = process.get('current_node_id')
        current_node = None
        for node in process.get('nodes', []):
            if node.get('id') == current_node_id:
                current_node = node
                break
        
        response['status'] = 'success'
        response['message'] = 'Process status retrieved'
        response['data'] = {
            'status': process.get('status', 'unknown'),
            'current_node': current_node,
            'path': process.get('path', []),
            'error': process.get('error')
        }
    else:
        found = False
        processes_dir = os.path.join("data", "processes")
        
        if os.path.exists(processes_dir):
            for structure_id in os.listdir(processes_dir):
                process_dir = os.path.join(processes_dir, structure_id)
                if os.path.isdir(process_dir):
                    process_file = os.path.join(process_dir, "process.json")
                    
                    if os.path.exists(process_file):
                        process_records = file_handler.load_data(process_file, {})
                        
                        for process in process_records.get('runs', []):
                            if process.get('id') == process_id:
                                current_node_id = process.get('current_node_id')
                                current_node = None
                                for node in process.get('nodes', []):
                                    if node.get('id') == current_node_id:
                                        current_node = node
                                        break
                                
                                response['status'] = 'success'
                                response['message'] = 'Process status retrieved from file'
                                response['data'] = {
                                    'status': process.get('status', 'unknown'),
                                    'current_node': current_node,
                                    'path': process.get('path', []),
                                    'error': process.get('error')
                                }
                                found = True
                                break
                
                if found:
                    break
        
        if not found:
            response['message'] = 'Process not found'
    
    return response

def extract_nodes(structure_data):
    nodes = []
    
    if 'structure' in structure_data and 'nodes' in structure_data['structure']:
        node_data = structure_data['structure']['nodes']
        if isinstance(node_data, list):
            nodes = node_data
        elif isinstance(node_data, dict):
            nodes = list(node_data.values())
    elif 'nodes' in structure_data:
        node_data = structure_data['nodes']
        if isinstance(node_data, list):
            nodes = node_data
        elif isinstance(node_data, dict):
            nodes = list(node_data.values())
    
    for node in nodes:
        if 'id' not in node:
            node['id'] = str(uuid.uuid4())
    
    return nodes

def extract_connections(structure_data):
    connections = []
    
    if 'structure' in structure_data and 'connections' in structure_data['structure']:
        connection_data = structure_data['structure']['connections']
        if isinstance(connection_data, list):
            connections = connection_data
        elif isinstance(connection_data, dict):
            connections = list(connection_data.values())
    elif 'connections' in structure_data:
        connection_data = structure_data['connections']
        if isinstance(connection_data, list):
            connections = connection_data
        elif isinstance(connection_data, dict):
            connections = list(connection_data.values())
    
    for connection in connections:
        if 'from' not in connection and 'source' in connection:
            connection['from'] = connection['source']
        if 'to' not in connection and 'target' in connection:
            connection['to'] = connection['target']
    
    return connections

def find_start_node(nodes):
    for node in nodes:
        node_type = node.get('type', '').lower()
        if node_type == 'start':
            return node
    
    for node in nodes:
        node_name = node.get('name', '').lower()
        if 'start' in node_name:
            return node
    
    return nodes[0] if nodes else None

def find_finish_node(nodes):
    for node in nodes:
        node_type = node.get('type', '').lower()
        if node_type in ['finish', 'end']:
            return node
    
    for node in nodes:
        node_name = node.get('name', '').lower()
        if 'finish' in node_name or 'end' in node_name:
            return node
    
    return None

def find_next_node(current_node_id, nodes, connections):
    outgoing_connections = []
    for connection in connections:
        if connection.get('from') == current_node_id:
            outgoing_connections.append(connection)
    
    if not outgoing_connections:
        return None
    
    selected_connection = random.choice(outgoing_connections)
    next_node_id = selected_connection.get('to')
    
    for node in nodes:
        if node.get('id') == next_node_id:
            return node
    
    return None

def handle_process_request(request):
    response = {
        'status': 'error',
        'message': 'Invalid process request'
    }
    
    action = request.get('action', '')
    user_id = request.get('userid', '')
    
    if not user_id:
        response['message'] = 'User not authenticated'
        return response
    
    if action == 'execute_node':
        response['request'] = request
        response['userid'] = user_id
        return execute_node(response)
    elif action == 'process_data':
        processing_type = request.get('processing_type', '')
        
        if not processing_type:
            response['message'] = 'Missing processing_type parameter'
            return response
        
        if processing_type == 'workflow':
            response['request'] = request
            response['userid'] = user_id
            return start_process(response)
        else:
            response['message'] = f'Unknown processing type: {processing_type}'
            return response
    else:
        response['message'] = f'Unknown action: {action}'
        return response

def get_process_directory(structure_id):
    process_dir = os.path.join("data", "processes", structure_id)
    file_handler.ensure_directory(process_dir)
    
    output_dir = os.path.join(process_dir, "output")
    file_handler.ensure_directory(output_dir)
    
    process_file = os.path.join(process_dir, "process.json")
    if not os.path.exists(process_file):
        process_data = {
            "id": structure_id,
            "created_at": int(time.time()),
            "last_updated": int(time.time()),
            "runs": []
        }
        file_handler.save_data(process_file, process_data)
    
    return process_dir