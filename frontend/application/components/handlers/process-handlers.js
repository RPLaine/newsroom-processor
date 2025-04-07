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

    // Jobs - initial setup
    const initialJobFunctions = [
        startProcess(),
        findNode('start')
    ];
    
    for (const result of initialJobFunctions) {
        if (result === null || appState.workflowState === WORKFLOW_STATES.FINISHED) {
            endMainProcess('Workflow completed or terminated early.');
            return;
        }
        job(result);
        await delay(2000);
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
            
            if (result === null) break;
            job(result);
            await delay(2000);
        }
    } while (result !== null && appState.workflowState === WORKFLOW_STATES.RUNNING);

    endMainProcess('Completed successfully.');
}

function executeNode() {
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
        return createJobEntry('Finish node reached', {
            nodeId: appState.currentNode.id,
            message: 'Workflow completed successfully',
            timestamp: new Date().toISOString()
        });
    }
    
    // This is a placeholder implementation
    // Add specific logic for different node types here
    
    const executionResult = {
        nodeId: appState.currentNode.id,
        nodeType: nodeType,
        executed: true,
        timestamp: new Date().toISOString()
    };
    
    return createJobEntry('Node executed', executionResult);
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