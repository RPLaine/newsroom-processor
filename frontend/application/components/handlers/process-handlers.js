import { sendRequest } from '../api.js';
import appState from '../../components/state.js';
import { registerButtonHandler, showError, initCollapsibleSections } from '../ui.js';
import * as handlerStyling from './utils/handler-styling.js'

function processMain() {
    console.log('Process main function called');
    appState.isProcessing = true;
    appState.jobs = [];
    appState.currentNode = null;

    console.log('AppState JSON', appState);

    // get relevant data from appState
    const initialDictionary = {
        "name": appState.currentStructure.name,
        "designer": appState.currentStructure.username,
        "nodes": appState.currentStructure.nodes?.length || 0,
        "connections": appState.currentStructure.connections?.length || 0,
    }

    // create an appState section
    handlerStyling.collapsibleSection('Process started', initialDictionary);
    
    // Initialize the collapsible sections after adding new content
    initCollapsibleSections();
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

function createJobElement(job) {
    const jobElement = document.createElement('div');
    jobElement.className = 'collapsible-section';
    
    const heading = document.createElement('h4');
    heading.className = 'collapsible-heading';
    heading.innerHTML = `${job.name || job.id} <span class="toggle-icon">▶</span>`;
    
    const content = document.createElement('div');
    content.className = 'collapsible-content collapsed';
    
    // Format job data in a structured way like other sections
    let jobContent = '<div class="structure-data-content">';
    jobContent += `<div><strong>Status:</strong> ${job.status}</div>`;
    jobContent += `<div><strong>Start Time:</strong> ${job.start_time}</div>`;
    jobContent += `<div><strong>End Time:</strong> ${job.end_time}</div>`;
    jobContent += `<div><strong>Output:</strong> ${job.output || 'No output'}</div>`;
    jobContent += '</div>';
    
    content.innerHTML = jobContent;
    
    jobElement.appendChild(heading);
    jobElement.appendChild(content);
    
    return jobElement;
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