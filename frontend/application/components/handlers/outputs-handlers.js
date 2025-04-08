/**
 * Outputs tab event handlers
 */
import * as api from '../api.js';
import appState from '../../components/state.js';
import { showError, formatDate, registerFormHandler, registerButtonHandler, initCollapsibleSections } from '../../components/ui.js';

// Store the currently selected file
appState.currentFile = null;

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
    
    // Register delete all outputs button handler
    registerButtonHandler('delete-all-outputs-btn', async (event, button) => {
        console.log('Delete output files button clicked - moving all files to old/ directory');
        await deleteAllOutputFiles();
    });
    
    // Register button handler for file selection
    registerButtonHandler('select-file-btn', (event, button) => {
        event.stopPropagation(); // Prevent triggering the card click
        const structureCard = button.closest('.structure-card');
        if (!structureCard || !structureCard.dataset.file) return;
        
        selectFile(JSON.parse(structureCard.dataset.file));
    });
    
    // Add a document listener for file card clicks
    document.addEventListener('click', (event) => {
        const structureCard = event.target.closest('.structure-card[data-file]');
        if (!structureCard || event.target.closest('button')) return; // Skip if clicking on a button
        
        if (structureCard.dataset.file) {
            selectFile(JSON.parse(structureCard.dataset.file));
        }
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
    
    // Store current file ID to restore selection after refresh
    const currentFileId = appState.currentFile ? appState.currentFile.id : null;
    
    // Clear the container
    outputsContainer.innerHTML = '';
    console.log('Cleared outputs container');
    
    // Load files if needed
    if (!appState.currentStructure) {
        console.warn('No structure selected for outputs view');
        outputsContainer.innerHTML = '<div class="empty-state">No structure selected. Please select a structure from the Structures tab.</div>';
        // Clear selected file
        appState.currentFile = null;
        updateSelectedFileInfo();
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
            // Clear selected file
            appState.currentFile = null;
            updateSelectedFileInfo();
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
        
        // Restore current file selection if it still exists
        if (currentFileId) {
            const updatedFile = appState.generatedFiles.find(f => f.id === currentFileId);
            if (updatedFile) {
                appState.currentFile = updatedFile;
                updateSelectedFileInfo();
            } else {
                // Clear selected file if it no longer exists
                appState.currentFile = null;
                updateSelectedFileInfo();
            }
        }
    } catch (error) {
        console.error('Error loading output files:', error);
        outputsContainer.innerHTML = `<div class="empty-state">Error loading files: ${error.message}</div>`;
        // Clear selected file on error
        appState.currentFile = null;
        updateSelectedFileInfo();
    }
}

// The setupFileActionHandlers function has been removed as we now handle 
// file selection and actions through the standard button handler registry

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
                <div class="structure-card" data-file-id="${file.id}" data-file='${JSON.stringify(file)}'>
                    <div class="structure-content">
                        <h3>${file.filename}</h3>
                        <div class="structure-data-content">
                            <div>Created: ${timestamp}</div>
                            <div>Size: ${formatFileSize(file.size)}</div>
                            <div>Node: ${file.node_name || 'Unknown'}</div>
                        </div>
                    </div>
                    <div class="structure-actions">
                        <button class="btn select-file-btn primary" data-button-type="select-file-btn">Select</button>
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

// The modal-based viewFile function has been removed.
// We now use a direct file selection approach with the selectedFile section
// similar to how the Inputs tab handles node selection.

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

/**
 * Delete all output files
 */
async function deleteAllOutputFiles() {
    if (!appState.currentStructure) return;
    
    if (!confirm('Are you sure you want to delete all output files?')) {
        return;
    }
    
    try {
        const requestBody = {
            action: 'delete_all_output_files',
            structure_id: appState.currentStructure.id
        };
        
        const response = await api.sendRequest(requestBody);
        
        if (response.status === 'success') {
            // Clear files from state
            appState.generatedFiles = [];
            
            // Refresh the view
            await refreshOutputsView();
        } else {
            alert('Error deleting all files: ' + response.message);
        }
    } catch (error) {
        console.error('Error deleting all files:', error);
        alert('Error deleting all files: ' + error.toString());
    }
}

/**
 * Function to handle file selection
 */
function selectFile(file) {
    appState.currentFile = file;
    console.log(`Selected file: ${file.filename}`);
    
    // Ensure all collapsible sections are collapsed when a file is selected
    document.querySelectorAll('.collapsible-content').forEach(content => {
        content.classList.add('collapsed');
        const toggleIcon = content.previousElementSibling?.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.textContent = '▶';
        }
    });
    
    updateSelectedFileInfo();
}

/**
 * Function to update the selected file information
 */
function updateSelectedFileInfo() {
    const selectedFileContainer = document.getElementById('selected-file-info');
    
    if (!selectedFileContainer) return;
    
    // Hide if no file is selected
    if (!appState.currentFile) {
        selectedFileContainer.innerHTML = '<div class="empty-state">No file selected. Please select a file from the list above.</div>';
        return;
    }
    
    const file = appState.currentFile;
    const fileExtension = file.filename.split('.').pop().toLowerCase();
    const timestamp = new Date(file.created_at * 1000).toLocaleString();
    
    let fileDetailsHTML = `
        <div class="structure-header">
            <h3>${file.filename}</h3>
            <div class="structure-meta">
                <span class="structure-meta-item">Type: ${fileExtension.toUpperCase()}</span>
                <span class="structure-meta-item">Size: ${formatFileSize(file.size)}</span>
                <span class="structure-meta-item">Created: ${timestamp}</span>
                <span class="structure-meta-item">ID: ${file.id}</span>
            </div>
        </div>
    `;
    
    // Load file content if needed
    if (!file.content) {
        fileDetailsHTML += `<div class="loading">Loading file content...</div>`;
        loadFileContent(file.id).then(() => updateSelectedFileInfo());
    } else {
        // Display file content
        fileDetailsHTML += `
            <div class="file-content-container">
                <pre class="file-content">${escapeHtml(file.content)}</pre>
            </div>
            <div class="file-actions">
                <button class="btn delete-file-btn danger" data-file-id="${file.id}" data-button-type="delete-file-btn">Delete File</button>
            </div>
        `;
    }
    
    // Update the selected file container
    selectedFileContainer.innerHTML = fileDetailsHTML;
}

/**
 * Function to load file content from server
 */
async function loadFileContent(fileId) {
    if (!appState.generatedFiles) return null;
    
    const file = appState.generatedFiles.find(f => f.id === fileId);
    if (!file) return null;
    
    // Return if we already have content
    if (file.content) return file.content;
    
    try {
        const requestBody = {
            action: 'load_file',
            filepath: file.path
        };
        
        const response = await api.sendRequest(requestBody);
        
        if (response.status === 'success' && response.data) {
            // Cache the content for future use
            file.content = response.data.content;
            return file.content;
        } else {
            console.error('Error loading file content');
            return 'Error loading file content';
        }
    } catch (error) {
        console.error('Error loading file content:', error);
        return 'Error: ' + error.toString();
    }
}