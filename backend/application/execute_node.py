import backend.file_handler as file_handler
import backend.llm as llm
import backend.application.refinement as refinement
import os
import json
import uuid
import time

def handle_execute_node(response: dict) -> dict:
    """
    Executes a node in the structure, generating a file based on node content.
    Files are stored in user's output directory.
    
    Args:
        response: The request response object containing node data
        
    Returns:
        Updated response with execution results and file information
    """
    request = response.get('request', {})
    user_id = response.get('userid', '')
    structure_id = request.get('structure_id', '')
    node = request.get('current_node', {})
    
    if not user_id:
        response['status'] = 'error'
        response['message'] = 'User not authenticated'
        return response
        
    if not node:
        response['status'] = 'error'
        response['message'] = 'No node data provided'
        return response
        
    if not structure_id:
        response['status'] = 'error'
        response['message'] = 'Missing structure ID'
        return response
    
    # Create output directory path for the user and structure
    output_dir = os.path.join("data", "users", user_id, structure_id)
    file_handler.ensure_directory(output_dir)
    
    # Extract node content
    node_type = node.get('type', '').lower()
    node_name = node.get('name', '')
    node_config = node.get('configuration', {})
    
    # Skip file generation for start/finish nodes
    if node_type in ['start', 'finish', 'end']:
        response['status'] = 'success'
        response['message'] = f'Node {node_type} executed (no file generated)'
        response['data'] = {
            'node_executed': True,
            'file_generated': False
        }
        return response
    
    # Generate filename based on node name or type
    filename = f"{node_name or node_type}_{int(time.time())}"
    
    # Clean filename (remove special characters)
    filename = ''.join(c if c.isalnum() or c in ['-', '_'] else '_' for c in filename)
    
    # Generate file content using LLM
    file_content = generate_file_content(node)
    
    # Detect file extension based on content or node type
    file_extension = detect_file_extension(file_content, node_type)
    
    # Complete filename with extension
    full_filename = f"{filename}.{file_extension}"
    file_path = os.path.join(output_dir, full_filename)
    
    # Save file
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(file_content)
            
        # Update file registry for the structure
        registry_path = os.path.join(output_dir, "file_registry.json")
        registry = file_handler.load_data(registry_path, {"files": []})
        
        file_info = {
            "id": str(uuid.uuid4()),
            "filename": full_filename,
            "path": file_path,
            "node_id": node.get('id', ''),
            "node_name": node_name,
            "created_at": int(time.time()),
            "size": len(file_content),
            "content": file_content
        }
        
        registry["files"].append(file_info)
        file_handler.save_data(registry_path, registry)
        
        response['status'] = 'success'
        response['message'] = f'File {full_filename} generated successfully'
        response['data'] = {
            'node_executed': True,
            'file_generated': True,
            'file_info': file_info
        }
        
    except Exception as e:
        response['status'] = 'error'
        response['message'] = f'Error generating file: {str(e)}'
        
    return response

def generate_file_content(node):
    node_config = node.get('configuration', {})
    header = node_config.get('header', '')
    prompt = node_config.get('prompt', '')
    
    llm_prompt = f'''
<|im_system|>
You are a helpful assistant that generates file content based on instructions.
<|im_end|>
<|im_user|>
Generate content for a file based on the following information:

Header: {header}
Instructions: {prompt}

Your task is to generate appropriate content for a file based on this information.
Keep the content concise and focused on the requirements in the instructions.
<|im_end|>
<|im_assistant|>
'''

    response = llm.generate_llm_response(llm_prompt)

    refined_response = refinement.refine_response(response)

    return refined_response

def detect_file_extension(content, node_type):
    extension = "txt"
    
    if content.startswith("<!DOCTYPE html>") or "<html" in content[:100]:
        extension = "html"
    elif content.startswith("<?xml") or "<xml" in content[:100]:
        extension = "xml"
    elif "```json" in content or content.strip().startswith("{"):
        extension = "json"
    elif "```python" in content or "def " in content or "import " in content:
        extension = "py"
    elif "```javascript" in content or "function " in content or "const " in content:
        extension = "js"
    elif "```css" in content or content.find("{") > 0 and ":" in content:
        extension = "css"
    elif "```markdown" in content or content.startswith("#"):
        extension = "md"
    
    return extension

def get_output_files(user_id, structure_id):
    output_dir = os.path.join("data", "users", user_id, structure_id)
    registry_path = os.path.join(output_dir, "file_registry.json")
    
    if os.path.exists(registry_path):
        # Load the file registry
        files = file_handler.load_data(registry_path, {"files": []}).get("files", [])
        
        # Ensure each file has its content loaded if it exists in the registry but not in memory
        for file_info in files:
            # If file doesn't have content but has a path, load content from file
            if (not file_info.get("content") or file_info.get("content") == "") and file_info.get("path"):
                file_path = file_info.get("path")
                try:
                    if os.path.exists(file_path):
                        with open(file_path, 'r', encoding='utf-8') as f:
                            file_info["content"] = f.read()
                except Exception as e:
                    print(f"Error loading content for file {file_path}: {str(e)}")
                    file_info["content"] = f"Error loading content: {str(e)}"
        
        return files
    
    return []

def delete_output_file(user_id, structure_id, file_id):
    output_dir = os.path.join("data", "users", user_id, structure_id)
    registry_path = os.path.join(output_dir, "file_registry.json")
    
    if not os.path.exists(registry_path):
        return False
    
    registry = file_handler.load_data(registry_path, {"files": []})
    files = registry.get("files", [])
    
    for i, file_info in enumerate(files):
        if file_info.get("id") == file_id:
            file_path = file_info.get("path")
            
            files.pop(i)
            file_handler.save_data(registry_path, registry)
            
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
                
            return True
    
    return False

def delete_all_output_files(user_id, structure_id):
    """
    Move all output files for a structure to an "old" directory
    
    Args:
        user_id: ID of the current user
        structure_id: ID of the structure
        
    Returns:
        Boolean indicating success or failure
    """
    output_dir = os.path.join("data", "users", user_id, structure_id)
    registry_path = os.path.join(output_dir, "file_registry.json")
    
    if not os.path.exists(registry_path):
        return False
    
    # Create "old" directory if it doesn't exist
    old_dir = os.path.join(output_dir, "old")
    file_handler.ensure_directory(old_dir)
    
    # Load the file registry
    registry = file_handler.load_data(registry_path, {"files": []})
    files = registry.get("files", [])
    
    # Store original file paths and their new destination paths
    moved_files = []
    
    try:
        # Move each file to the old directory
        for file_info in files:
            file_path = file_info.get("path")
            
            if file_path and os.path.exists(file_path):
                filename = os.path.basename(file_path)
                new_path = os.path.join(old_dir, filename)
                
                # If a file with the same name exists in the old directory,
                # add a timestamp to make the filename unique
                if os.path.exists(new_path):
                    name, ext = os.path.splitext(filename)
                    new_path = os.path.join(old_dir, f"{name}_{int(time.time())}{ext}")
                
                # Move the file (os.rename is used for moving files)
                os.rename(file_path, new_path)
                
                # Store file movement information
                moved_files.append({
                    "original_path": file_path,
                    "new_path": new_path,
                    "file_id": file_info.get("id")
                })
        
        # Clear the file registry
        registry["files"] = []
        file_handler.save_data(registry_path, registry)
        
        return True
    except Exception as e:
        print(f"Error moving files to old directory: {str(e)}")
        
        # If there was an error, attempt to move files back to their original locations
        for file_move in moved_files:
            try:
                if os.path.exists(file_move["new_path"]):
                    os.rename(file_move["new_path"], file_move["original_path"])
            except Exception as restore_err:
                print(f"Error restoring file {file_move['original_path']}: {str(restore_err)}")
        
        return False

if __name__ == '__main__':
    # Test Case: Article Generation
    print("=== ARTICLE GENERATION TEST ===")
    test_response = {
        'userid': 'test_user_123',
        'request': {
            'structure_id': 'test_structure_456',
            'current_node': {
                'id': 'article_node_1',
                'type': 'article',
                'name': 'Game Design Article',
                'configuration': {
                    'header': 'Level Design Best Practices',
                    'prompt': 'Write an informative article about best practices in video game level design. Cover topics like pacing, player guidance, challenge balancing, and environmental storytelling.'
                }
            }
        }
    }
    
    # Execute the article node
    result = handle_execute_node(test_response)
    
    # Print the result
    print('EXECUTION RESULT:')
    print(json.dumps(result, indent=2))
    
    # If successful, print information about the generated file
    if result.get('status') == 'success' and result.get('data', {}).get('file_generated'):
        file_info = result.get('data', {}).get('file_info', {})
        print('\nGENERATED ARTICLE:')
        print(f"Filename: {file_info.get('filename')}")
        print(f"Path: {file_info.get('path')}")
        print(f"Size: {file_info.get('size')} bytes")
        
        # Print the article content
        try:
            with open(file_info.get('path'), 'r', encoding='utf-8') as f:
                content = f.read()
            print('\nARTICLE CONTENT PREVIEW (first 300 chars):')
            print(content[:300] + '...' if len(content) > 300 else content)
        except Exception as e:
            print(f'\nError reading file: {str(e)}')
            
    # Test file listing functionality
    print('\nLISTING FILES:')
    user_id = test_response.get('userid')
    structure_id = test_response.get('request', {}).get('structure_id')
    files = get_output_files(user_id, structure_id)
    print(json.dumps(files, indent=2))