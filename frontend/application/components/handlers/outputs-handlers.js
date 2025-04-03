/**
 * Outputs tab event handlers
 */
import * as api from '../api.js';
import appState from '../../components/state.js';
import { showError, formatDate, registerFormHandler, registerButtonHandler } from '../../components/ui.js';

/**
 * Setup event handlers for Outputs tab
 */
export function setupOutputsTabHandlers() {
    // Load outputs when tab is clicked
    document.getElementById('outputs-tab')?.addEventListener('click', () => {
        if (appState.currentJob) {
            updateOutputsList(appState.currentJob.outputs);
        }
    });
    
    // Register refresh button handler
    registerButtonHandler('refresh-outputs-btn', async (event, button) => {
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            // Fetch latest job data
            const response = await api.getJob(appState.currentJob.id);
            
            if (response.status === 'success' && response.data) {
                // Update current job
                appState.currentJob = response.data.job;
                
                // Update outputs list
                updateOutputsList(appState.currentJob.outputs);
                
                console.log('Files refreshed');
            } else {
                throw new Error(response.message || 'Refresh failed');
            }
        } catch (error) {
            showError('Error refreshing files', error);
        }
    });
    
    // Register button handlers for view and edit buttons
    registerButtonHandler('view-output-btn', (event, button) => {
        const outputItem = button.closest('.output-item');
        if (!outputItem || !outputItem.dataset.item) return;
        
        viewOutput(JSON.parse(outputItem.dataset.item));
    });
    
    registerButtonHandler('edit-output-btn', (event, button) => {
        const outputItem = button.closest('.output-item');
        if (!outputItem || !outputItem.dataset.item) return;
        
        editOutput(JSON.parse(outputItem.dataset.item));
    });
}

/**
 * Update outputs list in UI
 * 
 * @param {Array} outputs - Outputs data
 */
export function updateOutputsList(outputs) {
    const outputsList = document.getElementById('outputs-list');
    if (!outputsList) return;
    
    if (!outputs || outputs.length === 0) {
        outputsList.innerHTML = '<p class="empty-state">No files available. Files will appear here after processing your structure.</p>';
        return;
    }
    
    outputsList.innerHTML = '';
    
    outputs.forEach(output => {
        const outputElement = document.createElement('div');
        outputElement.className = 'output-item';
        
        // Format date
        const date = output.timestamp ? formatDate(new Date(output.timestamp * 1000)) : 'Unknown';
        
        // Truncate preview
        const contentPreview = output.content?.length > 200 
            ? output.content.substring(0, 200) + '...' 
            : output.content;
            
        outputElement.innerHTML = `
            <h3>${output.file_name || 'Untitled'}</h3>
            <div class="output-preview">
                <pre>${contentPreview || 'No content'}</pre>
            </div>
            <div class="output-meta">
                <span>Created: ${date}</span>
                <button class="btn view-output-btn">View</button>
                <button class="btn edit-output-btn">Edit</button>
            </div>
        `;
        
        // Store output data in dataset for later retrieval
        outputElement.dataset.item = JSON.stringify(output);
        
        outputsList.appendChild(outputElement);
    });
}

/**
 * View output in form
 * 
 * @param {Object} output - Output data
 */
function viewOutput(output) {
    // Create modal or use existing view to display the output
    // Since we removed the create output form, we need to handle viewing differently
    alert(`${output.file_name}\n\n${output.content}`);
}

/**
 * Edit output in form
 * 
 * @param {Object} output - Output data
 */
function editOutput(output) {
    // For now, just view the output
    viewOutput(output);
}