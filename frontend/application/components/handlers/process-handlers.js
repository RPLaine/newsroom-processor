import { sendRequest } from '../api.js';
import appState from '../../components/state.js';
import { registerButtonHandler, initCollapsibleSections } from '../ui.js';
import * as handlerStyling from './utils/handler-styling.js';

// Store a special flag to handle finish nodes
const WORKFLOW_STATES = {
  RUNNING: 'running',
  FINISHED: 'finished',
  ERROR: 'error'
};

async function mainProcess() {
    // Start processing state
    console.log('-----> Process main function called');
    appState.isProcessing = true;
    appState.workflowState = WORKFLOW_STATES.RUNNING;
    appState.generatedFiles = [];
    console.log('AppState JSON', appState);

    // Clear the workflow container
    const workflowContainer = document.getElementById('workflow-container');
    if (workflowContainer) {
        workflowContainer.innerHTML = '';
    }

    // Clear previous jobs and current node
    appState.jobs = [];
    appState.currentNode = null;
    console.log('Jobs after clearing', appState.jobs);

    // Create a helper function to process jobs with consistent delays
    async function processJobWithDelay(jobResult) {
        if (jobResult === null || appState.workflowState === WORKFLOW_STATES.FINISHED) {
            return false; // Signal to stop processing
        }
        
        // Wait 2 seconds before showing the next job result
        await delay(2000);
        
        // Show the job result
        job(jobResult);
        
        return true; // Signal to continue processing
    }

    // Process the starting job
    const startJobResult = startProcess();
    if (!await processJobWithDelay(startJobResult)) {
        endMainProcess('Workflow completed or terminated early.');
        return;
    }

    // Process the find start node job
    const findStartNodeResult = findNode('start');
    if (!await processJobWithDelay(findStartNodeResult)) {
        endMainProcess('Workflow completed or terminated early.');
        return;
    }

    // Process node functions until one returns null
    let result = true;
    const processingSteps = [
        () => findConnections(appState.currentNode),
        chooseNextNode,
        () => findNode(appState.nextNodeID),
        executeNode
    ];
    
    do {
        for (const step of processingSteps) {
            if (appState.workflowState === WORKFLOW_STATES.FINISHED) {
                break; // Exit the loop immediately if finished
            }
            
            if (isAsync(step)) {
                result = await step();
            } else {
                result = step();
            }
            
            if (!await processJobWithDelay(result)) {
                result = null;
                break;
            }
        }
    } while (result !== null && appState.workflowState === WORKFLOW_STATES.RUNNING);

    // Load output files after process completion
    await loadOutputFiles();
    
    // Switch to the outputs tab
    switchToOutputsTab();
    
    endMainProcess('Completed successfully.');
}

async function executeNode() {
    if (!appState.currentNode) {
        console.error('No current node to execute.');
        return null;
    }
    
    // Execute node logic based on node type
    const nodeType = appState.currentNode.type || 'unknown';
    console.log(`Executing node of type: ${nodeType}`);
    
    // Check if this is a finish node - if so, return null to end the process
    if (nodeType.toLowerCase() === 'finish') {
        console.log('Finish node detected. Ending workflow process.');
        appState.workflowState = WORKFLOW_STATES.FINISHED;
        return createJobEntry('Finish node reached', {
            nodeId: appState.currentNode.id,
            message: 'Workflow completed successfully',
            timestamp: new Date().toISOString()
        });
    }
    
    // Call backend to execute node and generate file
    try {
        const requestBody = {
            action: 'execute_node',
            structure_id: appState.currentStructure.id,
            current_node: appState.currentNode
        };
        
        console.log('Request body for executing node:', requestBody);
        
        const response = await sendRequest(requestBody);
        console.log('Response from execute_node:', response);
        
        // If file was generated, add to our files list
        if (response?.data?.file_generated && response?.data?.file_info) {
            if (!appState.generatedFiles) {
                appState.generatedFiles = [];
            }
            appState.generatedFiles.push(response.data.file_info);
        }
        
        const executionResult = {
            nodeId: appState.currentNode.id,
            nodeType: nodeType,
            executed: true,
            fileGenerated: response?.data?.file_generated || false,
            fileInfo: response?.data?.file_info || null,
            timestamp: new Date().toISOString()
        };
        
        return createJobEntry('Node executed', executionResult);
    } catch (error) {
        console.error('Error executing node:', error);
        return createJobEntry('Node execution error', {
            nodeId: appState.currentNode.id,
            error: error.toString(),
            timestamp: new Date().toISOString()
        });
    }
}

async function loadOutputFiles() {
    if (!appState.currentStructure) {
        console.error('No structure selected.');
        return;
    }
    
    try {
        const requestBody = {
            action: 'get_output_files',
            structure_id: appState.currentStructure.id
        };
        
        const response = await sendRequest(requestBody);
        console.log('Output files response:', response);
        
        if (response?.data?.files) {
            appState.generatedFiles = response.data.files;
        }
    } catch (error) {
        console.error('Error loading output files:', error);
    }
}

function switchToOutputsTab() {
    // Find and click the outputs tab
    const outputsTab = document.getElementById('outputs-tab');
    if (outputsTab) {
        outputsTab.click();
    }
}

async function chooseNextNode() {
    const goingToConnections = appState.currentNode?.connections?.goingTo || [];
    if (!goingToConnections.length) return null;
    
    if (goingToConnections.length === 1) {
        appState.nextNodeID = goingToConnections[0];
    } else {
        const requestBody = {
            action: 'choose_next_node',
            current_node: appState.currentNode,
            connections: goingToConnections.map(id => 
                appState.currentStructure.structure.nodes.find(n => n.id === id)
            ).filter(Boolean)
        };

        console.log('Request body for choosing next node:', requestBody);
        
        try {
            const response = await sendRequest(requestBody);
            console.log('Response from backend:', response);
            // Check for both camelCase and snake_case properties
            if (response?.nextNodeID) {
                appState.nextNodeID = response.nextNodeID;
            } else if (response?.next_node_id) {
                appState.nextNodeID = response.next_node_id;
            } else {
                console.warn('Backend did not return a valid nextNodeID. Breaking process loop.');
                return null; // Break the processing loop
            }
        } catch (error) {
            console.error('Error while choosing next node:', error);
            return null; // Break the processing loop on error
        }
    }
    
    return createJobEntry('Next node selected', {
        nextNodeID: appState.nextNodeID,
        availableConnections: goingToConnections
    });
}

function findConnections(node = appState.currentNode) {
    let connections = {
        goingTo: appState.currentStructure.structure.connections.filter(c => c.startNode === node.id).map(c => c.endNode),
        comingFrom: appState.currentStructure.structure.connections.filter(c => c.endNode === node.id).map(c => c.startNode)
    }
    node.connections = connections;
    return createJobEntry('Connections found', connections);
}

function findNode(nodeTypeOrId = appState.currentNode.id) {
    if (!nodeTypeOrId) {
        console.error('Node type or ID is not provided.');
        return null;
    }
    if (appState.nodeTypes.includes(nodeTypeOrId)) {
        appState.currentNode = appState.currentStructure.structure.nodes.find(n => n.type === nodeTypeOrId);
    } else {
        appState.currentNode = appState.currentStructure.structure.nodes.find(n => n.id === nodeTypeOrId);
    }
    if (!appState.currentNode) {
        console.error('Node not found.');
        return null;
    }
    
    // Check if this is a finish node - if so, return null to end the process
    const nodeType = appState.currentNode.type?.toLowerCase() || '';
    if (nodeType === 'finish') {
        console.log('Finish node detected in findNode. Ending workflow process.');
        appState.workflowState = WORKFLOW_STATES.FINISHED;
        return createJobEntry('Finish node reached', {
            nodeId: appState.currentNode.id,
            message: 'Workflow completed successfully',
            timestamp: new Date().toISOString()
        });
    }
    
    return createJobEntry('Find node', appState.currentNode);
}

function startProcess() {
    let initialDictionary = {
        "name": appState.currentStructure.name,
        "designer": appState.currentStructure.username,
        "nodes": appState.currentStructure.structure.nodes?.length || 0,
        "connections": appState.currentStructure.structure.connections?.length || 0,
    }
    return createJobEntry('Process started', initialDictionary);
}

function createJobEntry(name, content) {
    let job = {
        name: name,
        content: content
    }
    console.log(name, job);

    handlerStyling.collapsibleSection(name, content);
    initCollapsibleSections();
    return job;
}

export function resetProcessTab() {
    const workflowContainer = document.getElementById('workflow-container');
    if (workflowContainer) {
        workflowContainer.innerHTML = '';
        
        if (!appState.currentStructure) {
            workflowContainer.innerHTML = '<div class="empty-state">No structure selected. Please select a structure from the Structures tab before starting a process.</div>';
        } else {
            workflowContainer.innerHTML = '<div class="empty-state">No structure processed yet. Click the Start button to begin executing your workflow structure.</div>';
        }
    }
}

export function setupProcessTabHandlers() {
    document.getElementById('process-tab')?.addEventListener('click', () => {
        refreshWorkflowView(appState.jobs);
    });

    registerButtonHandler('start-process-btn', async () => {
        if (!appState.currentStructure) {
            showEmptyStateMessage('No structure selected. Please select a structure from the Structures tab before starting a process.');
            return;
        }

        mainProcess();
    });
}

export function setupOutputsTab() {
    document.getElementById('outputs-tab')?.addEventListener('click', async () => {
        await refreshOutputsView();
    });
}

async function refreshOutputsView() {
    const outputsContainer = document.getElementById('outputs-container');
    if (!outputsContainer) return;
    
    // Clear the container
    outputsContainer.innerHTML = '';
    
    // Load files if needed
    if (!appState.generatedFiles || appState.generatedFiles.length === 0) {
        await loadOutputFiles();
    }
    
    // Check if we have files to display
    if (!appState.generatedFiles || appState.generatedFiles.length === 0) {
        outputsContainer.innerHTML = '<div class="empty-state">No output files generated. Run a process to generate files.</div>';
        return;
    }
    
    // Create the files list
    const filesList = document.createElement('div');
    filesList.className = 'files-list';
    
    // Add header
    const header = document.createElement('div');
    header.className = 'files-header';
    header.innerHTML = `
        <h3>Generated Files (${appState.generatedFiles.length})</h3>
        <p>These files were generated during the node workflow execution.</p>
    `;
    filesList.appendChild(header);
    
    // Add each file as a list item
    appState.generatedFiles.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // Format the timestamp
        const timestamp = new Date(file.created_at * 1000).toLocaleString();
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.filename}</div>
                <div class="file-meta">
                    <span>Created: ${timestamp}</span>
                    <span>Size: ${formatFileSize(file.size)}</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="view-file-btn" data-file-id="${file.id}">View</button>
                <button class="delete-file-btn" data-file-id="${file.id}">Delete</button>
            </div>
        `;
        
        filesList.appendChild(fileItem);
    });
    
    outputsContainer.appendChild(filesList);
    
    // Add event listeners to the buttons
    document.querySelectorAll('.view-file-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const fileId = e.target.dataset.fileId;
            await viewFile(fileId);
        });
    });
    
    document.querySelectorAll('.delete-file-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const fileId = e.target.dataset.fileId;
            await deleteFile(fileId);
        });
    });
}

async function viewFile(fileId) {
    if (!appState.generatedFiles) return;
    
    const file = appState.generatedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    // Create modal for viewing file
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${file.filename}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <pre class="file-content"></pre>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load file content
    try {
        const requestBody = {
            action: 'load_file',
            filepath: file.path
        };
        
        const response = await sendRequest(requestBody);
        
        if (response.status === 'success' && response.data) {
            modal.querySelector('.file-content').textContent = response.data.content;
        } else {
            modal.querySelector('.file-content').textContent = 'Error loading file content';
        }
    } catch (error) {
        modal.querySelector('.file-content').textContent = 'Error: ' + error.toString();
    }
    
    // Add event listener to close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside of it
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

async function deleteFile(fileId) {
    if (!appState.currentStructure || !fileId) return;
    
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    try {
        const requestBody = {
            action: 'delete_output_file',
            structure_id: appState.currentStructure.id,
            file_id: fileId
        };
        
        const response = await sendRequest(requestBody);
        
        if (response.status === 'success') {
            // Remove file from state
            appState.generatedFiles = appState.generatedFiles.filter(f => f.id !== fileId);
            
            // Refresh the view
            await refreshOutputsView();
        } else {
            alert('Error deleting file: ' + response.message);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Error deleting file: ' + error.toString());
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

function refreshWorkflowView(jobs) {
    const workflowContainer = document.getElementById('workflow-container');
    if (workflowContainer) {
        workflowContainer.innerHTML = '';

        if (jobs.length === 0) {
            showEmptyStateMessage('No jobs available. Please start a process to see the workflow.');
            return;
        }

        jobs.forEach(job => {
            handlerStyling.collapsibleSection(job.name, job.content);
        });
        initCollapsibleSections();
    }
}

function showEmptyStateMessage(message) {
    const workflowContainer = document.getElementById('workflow-container');
    if (workflowContainer) {
        workflowContainer.innerHTML = '<div class="empty-state">' + message + '</div>';
    }
}

function endMainProcess(message) {
    console.log('-----> Main process ended: ' + message);
    console.log('AppState', appState);
    appState.isProcessing = false;
}

function job(f) {
    appState.jobs.push(f);
    return f;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isAsync(fn) {
    return fn.constructor.name === 'AsyncFunction';
}