/**
 * Outputs tab event handlers
 */
import * as api from '../api.js';
import appState from '../../components/state.js';
import { showError, formatDate, registerFormHandler, registerButtonHandler, initCollapsibleSections } from '../../components/ui.js';

/**
 * Setup event handlers for Outputs tab
 */
export function setupOutputsTabHandlers() {
    // Load outputs when tab is clicked
    document.getElementById('outputs-tab')?.addEventListener('click', async () => {
        await refreshOutputsView();
    });
    
    // Register refresh button handler
    registerButtonHandler('refresh-outputs-btn', async (event, button) => {
        await refreshOutputsView();
    });
}

/**
 * Refresh the outputs view with latest data
 */
async function refreshOutputsView() {
    const outputsContainer = document.getElementById('outputs-container');
    if (!outputsContainer) return;
    
    // Clear the container
    outputsContainer.innerHTML = '';
    
    // Load files if needed
    if (!appState.currentStructure) {
        outputsContainer.innerHTML = '<div class="empty-state">No structure selected. Please select a structure from the Structures tab.</div>';
        return;
    }
    
    try {
        const requestBody = {
            action: 'get_output_files',
            structure_id: appState.currentStructure.id
        };
        
        const response = await api.sendRequest(requestBody);
        
        if (response?.status === 'success' && response?.data?.files) {
            appState.generatedFiles = response.data.files;
        }
        
        // Check if we have files to display
        if (!appState.generatedFiles || appState.generatedFiles.length === 0) {
            outputsContainer.innerHTML = '<div class="empty-state">No output files generated. Run a process to generate files.</div>';
            return;
        }
        
        // Create the outputs view
        const outputsHTML = createOutputsView(appState.generatedFiles);
        outputsContainer.innerHTML = outputsHTML;
        
        // Initialize collapsible sections
        initCollapsibleSections();
        
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
    } catch (error) {
        console.error('Error loading output files:', error);
        outputsContainer.innerHTML = `<div class="empty-state">Error loading files: ${error.message}</div>`;
    }
}

/**
 * Create the HTML for the outputs view
 * 
 * @param {Array} files - Array of file objects
 * @returns {string} HTML for the outputs view
 */
function createOutputsView(files) {
    // Group files by extension
    const filesByType = {};
    
    files.forEach(file => {
        const extension = file.filename.split('.').pop().toLowerCase();
        if (!filesByType[extension]) {
            filesByType[extension] = [];
        }
        filesByType[extension].push(file);
    });
    
    let html = `
        <div class="structure-header">
            <h3>Generated Files (${files.length})</h3>
            <div class="structure-meta">
                <span class="structure-meta-item">Structure: ${appState.currentStructure.name || 'Unnamed'}</span>
                <button id="refresh-outputs-btn" class="btn primary">Refresh</button>
            </div>
        </div>
    `;
    
    // Add a section for each file type
    for (const [extension, typeFiles] of Object.entries(filesByType)) {
        html += `
            <div class="collapsible-section">
                <h4 class="collapsible-heading">
                    ${extension.toUpperCase()} Files (${typeFiles.length}) <span class="toggle-icon">▼</span>
                </h4>
                <div class="collapsible-content">
        `;
        
        // Add each file as a card
        typeFiles.forEach(file => {
            const timestamp = new Date(file.created_at * 1000).toLocaleString();
            
            html += `
                <div class="structure-card" data-file-id="${file.id}">
                    <div class="structure-content">
                        <h3>${file.filename}</h3>
                        <div class="structure-data-content">
                            <div>Created: ${timestamp}</div>
                            <div>Size: ${formatFileSize(file.size)}</div>
                            <div>Node: ${file.node_name || 'Unknown'}</div>
                        </div>
                    </div>
                    <div class="structure-actions">
                        <button class="btn view-file-btn primary" data-file-id="${file.id}">View</button>
                        <button class="btn delete-file-btn" data-file-id="${file.id}">Delete</button>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    return html;
}

/**
 * Format file size in human-readable format
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

/**
 * View file content
 * 
 * @param {string} fileId - File ID
 */
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
                <pre class="file-content">Loading content...</pre>
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
        
        const response = await api.sendRequest(requestBody);
        
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

/**
 * Delete a file
 * 
 * @param {string} fileId - File ID
 */
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
        
        const response = await api.sendRequest(requestBody);
        
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