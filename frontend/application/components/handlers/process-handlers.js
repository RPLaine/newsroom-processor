import * as api from '../api.js';
import appState from '../../components/state.js';
import { registerButtonHandler } from '../ui.js';

export function resetProcessTab() {
    const workflowArea = document.getElementById('workflow-area');
    if (workflowArea) {
        if (!appState.currentStructure) {
            workflowArea.innerHTML = '<div class="empty-state">No structure selected. Please select a structure from the Structures tab before starting a process.</div>';
        } else {
            workflowArea.innerHTML = '';
        }
    }
    appState.currentProcessId = null;
    appState.nodeHistory = [];
}

export function setupProcessTabHandlers() {
    document.getElementById('process-tab')?.addEventListener('click', () => {
        refreshWorkflowView(appState.nodeHistory);
    });

    registerButtonHandler('start-process-btn', async () => {
        if (!appState.currentStructure) {
            showEmptyStateMessage('No structure selected. Please select a structure from the Structures tab before starting a process.');
            return;
        }
          
        logNodeTransition('Starting process with structure', appState.currentStructure.name || 'Unnamed');
        const response = await api.startProcess(appState.currentStructure);
        
        if (response.status === 'success' && response.data) {
            if (response.data.current_node) {
                const nodeName = response.data.current_node.name || response.data.current_node.id;
                logNodeTransition('Started at node', nodeName);
                updateCurrentNodeDisplay(response.data.current_node);
            }
            
            if (response.data.process_id) {
                appState.currentProcessId = response.data.process_id;
                monitorProcessStatus(response.data.process_id);
            }
        }
    });

    registerButtonHandler('execute-node-btn', async () => {
        if (!appState.currentProcessId || !appState.currentNode) {
            showEmptyStateMessage('No active process or current node. Please start a process first.');
            return;
        }
        
        try {
            logNodeTransition('Executing node', appState.currentNode.name || appState.currentNode.id);
            
            const response = await api.executeNode(appState.currentProcessId);
            
            if (response.status === 'success' && response.data) {
                if (response.data.next_node) {
                    updateCurrentNodeDisplay(response.data.next_node);
                    logNodeTransition('Moved to node', response.data.next_node.name || response.data.next_node.id);
                }
            } else {
                throw new Error(response.message || 'Node execution failed');
            }
        } catch (error) {
            console.error('Error executing node:', error);
        }
    });
}

function showEmptyStateMessage(message) {
    const workflowArea = document.getElementById('workflow-area');
    if (workflowArea) {
        workflowArea.innerHTML = '<div class="empty-state">' + message + '</div>';
    }
}

export function refreshWorkflowView(nodeHistory) {
    const workflowArea = document.getElementById('workflow-area');
    if (!workflowArea) return;
    
    if (!appState.currentStructure || !nodeHistory || nodeHistory.length === 0) {
        let emptyStateMessage = !appState.currentStructure
            ? 'No structure selected. Please select a structure from the Structures tab before starting a process.'
            : 'No nodes processed yet. Click the Start button to begin executing your workflow structure.';
        
        showEmptyStateMessage(emptyStateMessage);
        return;
    }
    
    workflowArea.innerHTML = '';
    
    // Create workflow visualization
    const workflowContainer = document.createElement('div');
    workflowContainer.className = 'workflow-container';
    
    // Add node history
    const historyList = document.createElement('div');
    historyList.className = 'node-history';
    
    nodeHistory.forEach(node => {
        const nodeElement = createNodeElement(node);
        historyList.appendChild(nodeElement);
    });
    
    workflowContainer.appendChild(historyList);
    
    // Add current node display if available
    if (appState.currentNode) {
        const currentNodeDisplay = document.createElement('div');
        currentNodeDisplay.className = 'current-node-display';
        currentNodeDisplay.innerHTML = `
            <h3>Current Node: ${appState.currentNode.name || appState.currentNode.id}</h3>
            <div class="node-details">
                <div class="node-type">${appState.currentNode.type || 'Unknown type'}</div>
                ${appState.currentNode.description ? `<div class="node-description">${appState.currentNode.description}</div>` : ''}
            </div>
        `;
        workflowContainer.appendChild(currentNodeDisplay);
    }
    
    workflowArea.appendChild(workflowContainer);
}

function createNodeElement(node) {
    const nodeElement = document.createElement('div');
    nodeElement.className = 'node-item';
    nodeElement.id = node.id;
    
    nodeElement.innerHTML = `
        <div class="node-header">
            <span class="node-name">${node.name || node.id}</span>
            <span class="node-timestamp">${new Date(node.timestamp).toLocaleString()}</span>
        </div>
        ${node.details ? `<div class="node-details">${node.details}</div>` : ''}
    `;
    
    return nodeElement;
}

async function monitorProcessStatus(processId) {
    let isRunning = true;
    let pollCount = 0;
    const MAX_POLLS = 100;
    const POLLING_INTERVAL_MS = 1500;
    
    while (isRunning && pollCount < MAX_POLLS) {
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
        
        try {
            const response = await api.sendRequest({
                action: 'get_process_status',
                process_id: processId
            });
            
            if (response.status === 'success' && response.data) {
                if (response.data.current_node) {
                    const node = response.data.current_node;
                    updateCurrentNodeDisplay(node);
                    const nodeName = node.name || node.id;
                    logNodeTransition('Moved to node', nodeName);
                }
                
                if (response.data.status === 'completed') {
                    logNodeTransition('Process completed!');
                    isRunning = false;
                }
                
                if (response.data.status === 'failed') {
                    const errorMessage = response.data.error || 'Unknown error';
                    logNodeTransition('Process failed', errorMessage);
                    isRunning = false;
                }
            } else {
                throw new Error(response.message || 'Process status check failed');
            }
        } catch (error) {
            logNodeTransition('Error checking process status', error.message);
        }
        
        pollCount++;
    }
    
    if (pollCount >= MAX_POLLS && isRunning) {
        logNodeTransition('Process polling timed out. The process might still be running in the background.');
    }
}

function updateCurrentNodeDisplay(node) {
    appState.currentNode = node;
    
    // Update UI to highlight current node
    const currentNodeDisplay = document.querySelector('.current-node-display');
    if (currentNodeDisplay) {
        currentNodeDisplay.innerHTML = `
            <h3>Current Node: ${node.name || node.id}</h3>
            <div class="node-details">
                <div class="node-type">${node.type || 'Unknown type'}</div>
                ${node.description ? `<div class="node-description">${node.description}</div>` : ''}
            </div>
        `;
    }
    
    // Highlight this node in the workflow visualization
    document.querySelectorAll('.node-item').forEach(el => {
        el.classList.remove('current');
    });
    
    const nodeElement = document.getElementById(node.id);
    if (nodeElement) {
        nodeElement.classList.add('current');
        nodeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

export function logNodeTransition(action, detail = '') {
    const workflowArea = document.getElementById('workflow-area');
    if (!workflowArea) return null;
    
    const emptyStateDiv = workflowArea.querySelector('.empty-state');
    if (emptyStateDiv) {
        workflowArea.innerHTML = '';
    }
    
    const nodeId = 'node-' + Date.now();
    const timestamp = new Date();
    
    // Add to app state
    const nodeData = {
        id: nodeId,
        name: action,
        details: detail,
        timestamp: timestamp.getTime()
    };
    
    appState.nodeHistory.push(nodeData);
    
    // Update UI
    refreshWorkflowView(appState.nodeHistory);
    
    return nodeId;
}