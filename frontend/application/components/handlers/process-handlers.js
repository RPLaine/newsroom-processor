import { sendRequest } from '../api.js';
import appState from '../../components/state.js';
import { registerButtonHandler, initCollapsibleSections } from '../ui.js';
import * as handlerStyling from './utils/handler-styling.js'

function processMain() {
    // Start processing state
    console.log('Process main function called');
    appState.isProcessing = true;
    console.log('AppState JSON', appState);

    // Clear previous jobs and current node
    appState.jobs = [];
    appState.currentNode = null;
    console.log('Jobs after clearing', appState.jobs);

    // Jobs
    appState.jobs.push(startProcess());
    appState.jobs.push(findNode('start'));
    appState.jobs.push(findConnections(appState.currentNode));

    // Checkpoint
    console.log('AppState', appState);

    // End processing state
    appState.isProcessing = false;
    console.log('Process main function ended');
}

function findConnections(node) {
    let connections = {
        goingTo: appState.currentStructure.structure.connections.filter(c => c.startNode === node.id).map(c => c.endNode),
        comingFrom: appState.currentStructure.structure.connections.filter(c => c.endNode === node.id).map(c => c.startNode)
    }
    node.connections = connections;
    return createJobEntry('Connections found', connections);
}

function findNode(node) {
    if (appState.nodeTypes.includes(node)) {
        appState.currentNode = appState.currentStructure.structure.nodes.find(n => n.type === node);
    } else {
        appState.currentNode = appState.currentStructure.structure.nodes.find(n => n.id === node);
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

        processMain();
    });
}

function refreshWorkflowView(jobs) {
    const workflowContainer = document.getElementById('workflow-container');
    if (workflowContainer) {
        workflowContainer.innerHTML = ''; // Clear previous content

        if (jobs.length === 0) {
            showEmptyStateMessage('No jobs available. Please start a process to see the workflow.');
            return;
        }

        jobs.forEach(job => {
            const jobElement = createJobElement(job);
            workflowContainer.appendChild(jobElement);
        });

        // Use the global collapsible sections handler
        initCollapsibleSections();
    }
}

function showEmptyStateMessage(message) {
    const workflowArea = document.getElementById('workflow-area');
    if (workflowArea) {
        workflowArea.innerHTML = '<div class="empty-state">' + message + '</div>';
    }
}

function setupCollapsibleSections() {
    const collapsibleHeadings = document.querySelectorAll('.collapsible-heading');
    collapsibleHeadings.forEach(heading => {
        heading.addEventListener('click', () => {
            const content = heading.nextElementSibling;
            if (content) {
                content.classList.toggle('collapsed');
                const icon = heading.querySelector('.toggle-icon');
                if (icon) {
                    icon.textContent = content.classList.contains('collapsed') ? '►' : '▼';
                }
            }
        });
    });
}