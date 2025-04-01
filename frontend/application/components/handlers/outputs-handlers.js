/**
 * Outputs tab event handlers
 */
import * as api from '../api.js';
import { appState, showNotification, showError, formatDate } from './common.js';

/**
 * Setup event handlers for Outputs tab
 */
export function setupOutputsTabHandlers() {
    // Create output form
    const outputForm = document.getElementById('create-output-form');
    outputForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            const fileName = document.getElementById('output-name').value;
            const content = document.getElementById('output-content').value;
            
            if (!fileName) {
                showError('File name is required');
                return;
            }
            
            if (!content) {
                showError('Content is required');
                return;
            }
            
            const response = await api.saveOutput(
                fileName,
                content,
                appState.currentJob.id
            );
            
            if (response.status === 'success' && response.data) {
                showNotification('Output saved successfully', 'success');
                
                // Update current job
                appState.currentJob = response.data.job;
                
                // Update outputs list
                updateOutputsList(appState.currentJob.outputs);
                
                // Clear form
                document.getElementById('output-name').value = '';
                document.getElementById('output-content').value = '';
            } else {
                throw new Error(response.message || 'Save failed');
            }
        } catch (error) {
            showError('Error saving output', error);
        }
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
        outputsList.innerHTML = '<p>No outputs saved yet.</p>';
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
        
        outputsList.appendChild(outputElement);
    });
    
    // Add event listeners to output buttons
    document.querySelectorAll('.view-output-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (outputs[index]) {
                viewOutput(outputs[index]);
            }
        });
    });
    
    document.querySelectorAll('.edit-output-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            if (outputs[index]) {
                editOutput(outputs[index]);
            }
        });
    });
}

/**
 * View output in form
 * 
 * @param {Object} output - Output data
 */
function viewOutput(output) {
    document.getElementById('output-name').value = output.file_name || '';
    document.getElementById('output-content').value = output.content || '';
}

/**
 * Edit output in form
 * 
 * @param {Object} output - Output data
 */
function editOutput(output) {
    // Same functionality as view currently
    viewOutput(output);
}