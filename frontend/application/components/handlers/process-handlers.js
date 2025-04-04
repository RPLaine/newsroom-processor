import { sendRequest } from '../api.js';
import appState from '../../components/state.js';
import { registerButtonHandler, initCollapsibleSections } from '../ui.js';
import * as handlerStyling from './utils/handler-styling.js'

function mainProcess() {
    // Start processing state
    console.log('-----> Process main function called');
    appState.isProcessing = true;
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
        if (result === null) {
            endMainProcess('Failed at initial functions.');
            return;
        }
        job(result);
    }

    // Process node functions until one returns null
    let result;
    do {
        const jobFunctions = [
            findConnections(),
            chooseNextNode(),
            findNode(),
            executeNode()
        ];
        
        for (result of jobFunctions) {
            if (result === null) break;
            job(result);
        }
    } while (result !== null);

    endMainProcess('Completed successfully.');
}

// TODO:
// 1. Backend: create the 'chooseNextNode' action.
// 2. Frontend: create the executeNode() function.
// 3. Backend: create the 'executeNode' action.

function executeNode() {
    if (!appState.currentNode) {
        console.error('No current node to execute.');
        return null;
    }
    
    // Execute node logic based on node type
    const nodeType = appState.currentNode.type || 'unknown';
    console.log(`Executing node of type: ${nodeType}`);
    
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

function chooseNextNode() {
    // If current node connections are empty, end the process
    if (!appState.currentNode || !appState.currentNode.connections) {
        console.error('No current node or connections available.');
        return null;
    }
    // Check if there are any outgoing connections
    const goingToConnections = appState.currentNode.connections.goingTo;
    if (!goingToConnections || goingToConnections.length === 0) {
        console.log('No outgoing connections found. Process complete.');
        return null;
    } else if (goingToConnections.length == 1) {
        // If there's only one connection, select it
        appState.nextNodeID = goingToConnections[0];
    } else {
        // If there are multiple connections, use sendRequest to ask for the next node
        // requestBody should contain current node prompt and prompts for each connected node
        // for the AI to understand the context and make a decision
        const requestBody = {
            action: 'chooseNextNode',
            currentNode: appState.currentNode,
            connections: goingToConnections.map(id => appState.currentStructure.structure.nodes.find(n => n.id === id))
        };
        console.log('Request body for choosing next node:', requestBody);
        sendRequest(requestBody).then(response => {
            if (response && response.nextNodeID) {
                appState.nextNodeID = response.nextNodeID;
                console.log('Next node selected:', appState.nextNodeID);
            } else {
                console.error('Failed to select next node. No response or invalid response received.');
            }
        }).catch(error => {
            console.error('Error while choosing next node:', error);
        });
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

function findNode(nodeTypeOrId = appState.nextNodeID) {
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