import { sendRequest } from '../api.js';
import appState from '../../components/state.js';
import { registerButtonHandler } from '../ui.js';

function processMain() {
    console.log('Process main function called');
    console.log(appState);
}

export function resetProcessTab() {
    const workflowContainer = document.getElementById('workflow-container');
    if (workflowContainer) {
        workflowContainer.innerHTML = '';
        appState.messages = [];
        
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

        setupCollapsibleSections();
    }
}

function createJobElement(job) {
    const jobElement = document.createElement('div');
    jobElement.className = 'section-collapsible';
    jobElement.innerHTML = `
        <div class="collapsible-heading">
            <span class="toggle-icon">►</span> ${job.name || job.id}
        </div>
        <div class="collapsible-content collapsed">
            <p>Status: ${job.status}</p>
            <p>Start Time: ${job.start_time}</p>
            <p>End Time: ${job.end_time}</p>
            <p>Output: ${job.output || 'No output'}</p>
        </div>`;
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