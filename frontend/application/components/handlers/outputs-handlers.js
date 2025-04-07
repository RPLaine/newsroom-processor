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
        console.log('Outputs tab clicked - triggering file list refresh');
        await refreshOutputsView();
    });
    
    // Register refresh button handler
    registerButtonHandler('refresh-outputs-btn', async (event, button) => {
        console.log('Refresh Outputs button clicked - manually refreshing file list');
        await refreshOutputsView();
    });
}

/**
 * Refresh the outputs view with latest data
 */
async function refreshOutputsView() {
    console.log('Starting to refresh outputs view');
    const outputsContainer = document.getElementById('outputs-list');
    if (!outputsContainer) {
        console.error('Outputs list not found in DOM');
        return;
    }
    
    // Clear the container
    outputsContainer.innerHTML = '';
    console.log('Cleared outputs container');
    
    // Load files if needed
    if (!appState.currentStructure) {
        console.warn('No structure selected for outputs view');
        outputsContainer.innerHTML = '<div class="empty-state">No structure selected. Please select a structure from the Structures tab.</div>';
        return;
    }
    
    try {
        console.log(`Fetching output files for structure: ${appState.currentStructure.id}`);
        const requestBody = {
            action: 'get_output_files',
            structure_id: appState.currentStructure.id
        };
        
        const response = await api.sendRequest(requestBody);
        console.log('Server response for output files:', response);
        
        if (response?.status === 'success' && response?.data?.files) {
            appState.generatedFiles = response.data.files;
            console.log(`Retrieved ${appState.generatedFiles.length} output files from server`);
        } else {
            console.warn('No files found in server response or response failed');
        }
        
        // Check if we have files to display
        if (!appState.generatedFiles || appState.generatedFiles.length === 0) {
            console.log('No output files to display');
            outputsContainer.innerHTML = '<div class="empty-state">No output files generated. Run a process to generate files.</div>';
            return;
        }
        
        // Create the outputs view
        console.log('Generating HTML for output files display');
        const outputsHTML = createOutputsView(appState.generatedFiles);
        outputsContainer.innerHTML = outputsHTML;
        console.log('Outputs HTML inserted into DOM');
        
        // Initialize collapsible sections
        initCollapsibleSections();
        console.log('Initialized collapsible sections for outputs');
        
        // Add event listeners to the buttons
        setupFileActionHandlers();
        console.log('Set up all file action handlers (view/delete/toggle)');
    } catch (error) {
        console.error('Error loading output files:', error);
        outputsContainer.innerHTML = `<div class="empty-state">Error loading files: ${error.message}</div>`;
    }
}

/**
 * Set up action handlers for file cards
 */
function setupFileActionHandlers() {
    // Add event listeners to the buttons
    document.querySelectorAll('.view-file-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const fileId = e.target.dataset.fileId;
            console.log(`View file button clicked for file ID: ${fileId}`);
            await viewFile(fileId);
        });
    });
    
    document.querySelectorAll('.delete-file-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const fileId = e.target.dataset.fileId;
            console.log(`Delete file button clicked for file ID: ${fileId}`);
            await deleteFile(fileId);
        });
    });
    
    // Add event listeners for the toggle preview buttons
    document.querySelectorAll('.toggle-preview-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const fileId = e.target.dataset.fileId;
            console.log(`Toggle preview button clicked for file ID: ${fileId}`);
            const cardElement = document.querySelector(`.structure-card[data-file-id="${fileId}"]`);
            if (!cardElement) return;
            
            const previewElement = cardElement.querySelector('.file-preview');
            const fullContentElement = cardElement.querySelector('.file-full-content');
            
            if (previewElement.style.display === 'none') {
                // Show preview, hide full content
                previewElement.style.display = 'block';
                fullContentElement.style.display = 'none';
                button.textContent = 'Show More';
                console.log(`Switched to preview mode for file ID: ${fileId}`);
            } else {
                // Show full content, hide preview
                previewElement.style.display = 'none';
                fullContentElement.style.display = 'block';
                button.textContent = 'Show Less';
                console.log(`Switched to full content mode for file ID: ${fileId}`);
            }
        });
    });
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
            
            // Prepare content preview if available
            let contentPreview = '';
            if (file.content) {
                // Limit preview to first 300 characters
                const previewText = file.content.length > 300 
                    ? file.content.substring(0, 300) + '...' 
                    : file.content;
                
                contentPreview = `
                    <div class="file-preview-container">
                        <div class="file-preview-header">
                            <h4>Content Preview</h4>
                            <button class="btn toggle-preview-btn" data-file-id="${file.id}">Show More</button>
                        </div>
                        <pre class="file-preview">${escapeHtml(previewText)}</pre>
                        <pre class="file-full-content" style="display:none;">${escapeHtml(file.content)}</pre>
                    </div>
                `;
            }
            
            html += `
                <div class="structure-card" data-file-id="${file.id}">
                    <div class="structure-content">
                        <h3>${file.filename}</h3>
                        <div class="structure-data-content">
                            <div>Created: ${timestamp}</div>
                            <div>Size: ${formatFileSize(file.size)}</div>
                            <div>Node: ${file.node_name || 'Unknown'}</div>
                        </div>
                        ${contentPreview}
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
 * Escape HTML characters in a string
 * 
 * @param {string} unsafe - Unsafe string
 * @returns {string} Escaped string
 */
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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
    
    // Check if we already have the content cached
    if (file.content) {
        modal.querySelector('.file-content').textContent = file.content;
    } else {
        // Load file content from server if not cached
        try {
            const requestBody = {
                action: 'load_file',
                filepath: file.path
            };
            
            const response = await api.sendRequest(requestBody);
            
            if (response.status === 'success' && response.data) {
                // Cache the content for future use
                file.content = response.data.content;
                modal.querySelector('.file-content').textContent = response.data.content;
            } else {
                modal.querySelector('.file-content').textContent = 'Error loading file content';
            }
        } catch (error) {
            modal.querySelector('.file-content').textContent = 'Error: ' + error.toString();
        }
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