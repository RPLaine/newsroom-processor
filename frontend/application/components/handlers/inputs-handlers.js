import * as api from '../api.js';
import { appState, showNotification, showError, formatDate } from './common.js';
import { registerFormHandler, registerButtonHandler } from '../ui.js';

export function setupInputsTabHandlers() {
    document.getElementById('inputs-tab')?.addEventListener('click', () => {
        updateStructureInfo();
    });
    
    // Register button handler for node selection
    registerButtonHandler('select-node-btn', (event, button) => {
        const structureCard = button.closest('.structure-card');
        if (!structureCard || !structureCard.dataset.node) return;
        
        selectNode(JSON.parse(structureCard.dataset.node));
    });
    
    // Register form handler for web search form
    registerFormHandler('web-search-form', async (event, form) => {
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            const query = document.getElementById('search-query').value;
            
            if (!query) {
                showError('Search query is required');
                return;
            }
            
            const response = await api.searchWeb(query, appState.currentJob.id);
            
            if (response.status === 'success' && response.data) {
                showNotification('Web search completed', 'success');
                
                appState.currentJob = response.data.job;
                
                updateInputsList(appState.currentJob.inputs);
                
                document.getElementById('search-query').value = '';
            } else {
                throw new Error(response.message || 'Web search failed');
            }
        } catch (error) {
            showError('Error performing web search', error);
        }
    });
    
    // Register form handler for RSS form
    registerFormHandler('rss-form', async (event, form) => {
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            const url = document.getElementById('rss-url').value;
            
            if (!url) {
                showError('RSS URL is required');
                return;
            }
            
            const response = await api.processRSS(url, appState.currentJob.id);
            
            if (response.status === 'success' && response.data) {
                showNotification('RSS feed processed', 'success');
                
                appState.currentJob = response.data.job;
                
                updateInputsList(appState.currentJob.inputs);
                
                document.getElementById('rss-url').value = '';
            } else {
                throw new Error(response.message || 'RSS processing failed');
            }
        } catch (error) {
            showError('Error processing RSS feed', error);
        }
    });
    
    // Register form handler for file upload form
    registerFormHandler('file-form', async (event, form) => {
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            const fileInput = document.getElementById('file-input');
            
            if (!fileInput.files || !fileInput.files[0]) {
                showError('Please select a file');
                return;
            }
            
            const file = fileInput.files[0];
            
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const fileContent = event.target.result;
                    
                    const response = await api.processFile(
                        file.name,
                        fileContent,
                        appState.currentJob.id
                    );
                    
                    if (response.status === 'success' && response.data) {
                        showNotification('File uploaded successfully', 'success');
                        
                        appState.currentJob = response.data.job;
                        
                        updateInputsList(appState.currentJob.inputs);
                        
                        fileInput.value = '';
                    } else {
                        throw new Error(response.message || 'File upload failed');
                    }
                } catch (error) {
                    showError('Error processing file', error);
                }
            };
            
            reader.readAsText(file);
        } catch (error) {
            showError('Error reading file', error);
        }
    });
}

export function updateInputsList(inputs) {
    const inputsList = document.getElementById('inputs-list');
    if (!inputsList) return;
    
    if (!inputs || inputs.length === 0) {
        inputsList.innerHTML = '<p class="empty-state">No tools have been used. Please use one of the tools above to add content to your project.</p>';
        return;
    }
    
    inputsList.innerHTML = '';
    
    inputs.forEach(input => {
        const inputElement = document.createElement('div');
        inputElement.className = 'input-item';
        
        const date = input.timestamp ? formatDate(new Date(input.timestamp * 1000)) : 'Unknown';
        
        let contentPreview = '';
        
        if (input.type === 'web_search') {
            contentPreview = `<strong>Query:</strong> ${input.query || 'Unknown'}<br>`;
            if (input.results && input.results.length > 0) {
                contentPreview += `<strong>Results:</strong><br>`;
                input.results.forEach(result => {
                    contentPreview += `• ${result.title || 'Unknown'}<br>`;
                });
            }
        } else if (input.type === 'rss_feed') {
            contentPreview = `<strong>Source:</strong> ${input.url || 'Unknown'}<br>`;
            if (input.items && input.items.length > 0) {
                contentPreview += `<strong>Items:</strong><br>`;
                input.items.forEach(item => {
                    contentPreview += `• ${item.title || 'Unknown'}<br>`;
                });
            }
        } else if (input.type === 'file') {
            contentPreview = `<strong>File:</strong> ${input.name || 'Unknown'}<br>`;
            const contentSample = input.content ? input.content.substring(0, 100) + '...' : 'No content';
            contentPreview += `<strong>Preview:</strong> ${contentSample}`;
        }
        
        inputElement.innerHTML = `
            <h3>${getInputTypeLabel(input.type)}</h3>
            <div class="input-content">${contentPreview}</div>
            <div class="input-meta">Added: ${date}</div>
        `;
        
        inputsList.appendChild(inputElement);
    });
}

export function getInputTypeLabel(type) {
    switch (type) {
        case 'web_search': return 'Web Search';
        case 'rss_feed': return 'RSS Feed';
        case 'file': return 'File Upload';
        default: return 'Input';
    }
}

export function updateStructureInfo() {
    const structureInfoContainer = document.getElementById('selected-structure-info');
    const inputsList = document.getElementById('inputs-list');
    const nodeToolsContainer = document.getElementById('node-tools-container');
    
    if (!structureInfoContainer || !inputsList) return;
    
    // Clear selected node when structure changes
    appState.currentNode = null;
    document.getElementById('selected-node-info').innerHTML = '<p class="empty-state">No node selected. Please select a node from the list.</p>';
    if (nodeToolsContainer) {
        nodeToolsContainer.style.display = 'none';
    }
    
    // Handle empty state for both containers
    if (!appState.currentStructure) {
        structureInfoContainer.innerHTML = '<p class="empty-state">No structure selected. Please select a structure from the Structures tab.</p>';
        inputsList.innerHTML = '<p class="empty-state">No structure selected. Please select a structure from the Structures tab.</p>';
        return;
    }
    
    const structure = appState.currentStructure;
    
    // Extract node and connection counts
    let nodeCount = 0;
    let connectionCount = 0;
    
    if (structure.structure && structure.structure.nodes) {
        if (Array.isArray(structure.structure.nodes)) {
            nodeCount = structure.structure.nodes.length;
        } else if (typeof structure.structure.nodes === 'object') {
            nodeCount = Object.keys(structure.structure.nodes).length;
        }
    } else if (structure.nodes) {
        if (Array.isArray(structure.nodes)) {
            nodeCount = structure.nodes.length;
        } else if (typeof structure.nodes === 'object') {
            nodeCount = Object.keys(structure.nodes).length;
        }
    }
    
    if (structure.structure && structure.structure.connections) {
        if (Array.isArray(structure.structure.connections)) {
            connectionCount = structure.structure.connections.length;
        } else if (typeof structure.structure.connections === 'object') {
            connectionCount = Object.keys(structure.structure.connections).length;
        }
    } else if (structure.connections) {
        if (Array.isArray(structure.connections)) {
            connectionCount = structure.connections.length;
        } else if (typeof structure.connections === 'object') {
            connectionCount = Object.keys(structure.connections).length;
        }
    }
    
    // Structure info HTML generation
    let structureDetailsHTML = `
        <div class="structure-header">
            <h3>${structure.name || 'Unnamed Structure'}</h3>
            <div class="structure-meta">
                <span class="structure-meta-item">ID: ${structure.id || 'Unknown'}</span>
                <span class="structure-meta-item">User: ${structure.username || 'Unknown'}</span>
                <span class="structure-meta-item">Nodes: ${nodeCount}</span>
                <span class="structure-meta-item">Connections: ${connectionCount}</span>
            </div>
        </div>
    `;
    
    if (nodeCount > 0) {
        structureDetailsHTML += `
            <div class="collapsible-section">
                <h4 class="collapsible-heading">
                    Nodes <span class="toggle-icon">▶</span>
                </h4>
                <div class="collapsible-content collapsed">
        `;
        
        let nodesObject = null;
        if (structure.structure && structure.structure.nodes) {
            if (Array.isArray(structure.structure.nodes)) {
                nodesObject = {};
                structure.structure.nodes.forEach((node, index) => {
                    nodesObject[`node_${index}`] = node;
                });
            } else {
                nodesObject = structure.structure.nodes;
            }
        } else if (structure.nodes) {
            if (Array.isArray(structure.nodes)) {
                nodesObject = {};
                structure.nodes.forEach((node, index) => {
                    nodesObject[`node_${index}`] = node;
                });
            } else {
                nodesObject = structure.nodes;
            }
        }
        
        if (nodesObject) {
            for (const [nodeId, node] of Object.entries(nodesObject)) {
                const nodeName = node.configuration?.header || node.title || node.name || nodeId;
                const nodeType = node.type || 'Unknown';
                const displayId = node.id || nodeId;
                
                structureDetailsHTML += `
                    <div class="structure-card" data-node='${JSON.stringify(node)}'>
                        <div class="structure-content">
                            <h3>${nodeName}</h3>
                            <div class="structure-data-content">
                                <div>Type: ${nodeType}</div>
                                <div>ID: ${displayId}</div>
                            </div>
                        </div>
                        <div class="structure-actions">
                            <button class="btn select-node-btn primary" data-button-type="select-node-btn">Select</button>
                        </div>
                    </div>
                `;
            }
        }
        
        structureDetailsHTML += `
                </div>
            </div>
        `;
    }
    
    // Add connections section if available
    if (connectionCount > 0) {
        structureDetailsHTML += `
            <div class="collapsible-section">
                <h4 class="collapsible-heading">
                    Connections <span class="toggle-icon">▶</span>
                </h4>
                <div class="collapsible-content collapsed">
        `;
        
        let connectionsObject = null;
        if (structure.structure && structure.structure.connections) {
            if (Array.isArray(structure.structure.connections)) {
                connectionsObject = {};
                structure.structure.connections.forEach((connection, index) => {
                    connectionsObject[`connection_${index}`] = connection;
                });
            } else {
                connectionsObject = structure.structure.connections;
            }
        } else if (structure.connections) {
            if (Array.isArray(structure.connections)) {
                connectionsObject = {};
                structure.connections.forEach((connection, index) => {
                    connectionsObject[`connection_${index}`] = connection;
                });
            } else {
                connectionsObject = structure.connections;
            }
        }
        
        if (connectionsObject) {
            for (const [connectionId, connection] of Object.entries(connectionsObject)) {
                const fromId = connection.from || connection.source || 'Unknown';
                const toId = connection.to || connection.target || 'Unknown';
                const connectionName = connection.name || connection.type || `Connection ${connectionId}`;
                const displayId = connection.id || connectionId;
                
                structureDetailsHTML += `
                    <div class="structure-card">
                        <div class="structure-content">
                            <h3>${connectionName}</h3>
                            <div class="structure-data-content">
                                <div>From: ${fromId}</div>
                                <div>To: ${toId}</div>
                                <div>ID: ${displayId}</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        structureDetailsHTML += `
                </div>
            </div>
        `;
    }
    
    // Update the structure info container
    structureInfoContainer.innerHTML = structureDetailsHTML;
    
    // Now handle the tools display in the inputs-list
    let hasTools = false;
    let toolsHTML = '';
    
    // Get all nodes with settings
    let nodesWithTools = [];
    if (structure.structure && structure.structure.nodes) {
        const nodes = Array.isArray(structure.structure.nodes) 
            ? structure.structure.nodes 
            : Object.values(structure.structure.nodes);
            
        nodesWithTools = nodes.filter(node => 
            node.configuration && 
            node.configuration.settings && 
            (node.configuration.settings.use_rss_feed || 
             node.configuration.settings.use_file_input || 
             node.configuration.settings.allow_automation)
        );
    }
    
    if (nodesWithTools.length > 0) {
        hasTools = true;
        
        nodesWithTools.forEach(node => {
            const nodeName = node.configuration?.header || node.title || node.name || node.id || 'Unnamed Node';
            const settings = node.configuration.settings;
            
            toolsHTML += `
                <div class="input-item">
                    <h3>${nodeName}</h3>
                    <div class="input-content">
                        <strong>Tools:</strong><br>
                        ${settings.use_rss_feed ? '• RSS Feed<br>' : ''}
                        ${settings.use_file_input ? '• File Input<br>' : ''}
                        ${settings.allow_automation ? '• Automation<br>' : ''}
                        ${settings.require_human_review ? '• Human Review Required<br>' : ''}
                    </div>
                    <div class="input-meta">Node ID: ${node.id || 'Unknown'}</div>
                </div>
            `;
        });
    }
    
    // Update the inputs-list container
    if (hasTools) {
        inputsList.innerHTML = toolsHTML;
    } else {
        inputsList.innerHTML = '<p class="empty-state">No tools configured in this structure. Tools can include RSS feed, file input, or automation settings.</p>';
    }
}

// Function to handle node selection
function selectNode(node) {
    appState.currentNode = node;
    showNotification(`Selected node: ${node.configuration?.header || node.title || node.name || node.id || 'Unnamed Node'}`, 'success');
    
    // Ensure all collapsible sections are collapsed when a node is selected
    document.querySelectorAll('.collapsible-content').forEach(content => {
        content.classList.add('collapsed');
        const toggleIcon = content.previousElementSibling?.querySelector('.toggle-icon');
        if (toggleIcon) {
            toggleIcon.textContent = '▶';
        }
    });
    
    updateSelectedNodeInfo();
}

// Function to update the selected node information
function updateSelectedNodeInfo() {
    const selectedNodeContainer = document.getElementById('selected-node-info');
    const nodeToolsContainer = document.getElementById('node-tools-container');
    
    if (!selectedNodeContainer || !nodeToolsContainer) return;
    
    // Hide tools container if no node is selected
    if (!appState.currentNode) {
        selectedNodeContainer.innerHTML = '<p class="empty-state">No node selected. Please select a node from the list.</p>';
        nodeToolsContainer.style.display = 'none';
        return;
    }
    
    const node = appState.currentNode;
    const nodeName = node.configuration?.header || node.title || node.name || node.id || 'Unnamed Node';
    const nodeType = node.type || 'Unknown';
    const nodeId = node.id || 'Unknown';
    
    let nodeDetailsHTML = `
        <div class="structure-header">
            <h3>${nodeName}</h3>
            <div class="structure-meta">
                <span class="structure-meta-item">Type: ${nodeType}</span>
                <span class="structure-meta-item">ID: ${nodeId}</span>
            </div>
        </div>
    `;
    
    // Display node configuration if available
    if (node.configuration) {
        nodeDetailsHTML += `
            <div class="collapsible-section">
                <h4 class="collapsible-heading">
                    Configuration <span class="toggle-icon">▶</span>
                </h4>
                <div class="collapsible-content collapsed">
                    <div class="structure-data-content">
        `;
        
        // Add configuration details
        if (node.configuration.prompt) {
            nodeDetailsHTML += `<div><strong>Prompt:</strong> ${node.configuration.prompt}</div>`;
        }
        
        if (node.configuration.settings) {
            nodeDetailsHTML += `<div><strong>Settings:</strong></div>`;
            const settings = node.configuration.settings;
            
            for (const [key, value] of Object.entries(settings)) {
                nodeDetailsHTML += `<div>• ${key}: ${value}</div>`;
            }
        }
        
        if (node.configuration.parameters) {
            nodeDetailsHTML += `<div><strong>Parameters:</strong></div>`;
            const parameters = node.configuration.parameters;
            
            for (const [key, value] of Object.entries(parameters)) {
                nodeDetailsHTML += `<div>• ${key}: ${value}</div>`;
            }
        }
        
        nodeDetailsHTML += `
                    </div>
                </div>
            </div>
        `;
    }
    
    // Display node data if available
    if (node.data) {
        nodeDetailsHTML += `
            <div class="collapsible-section">
                <h4 class="collapsible-heading">
                    Data <span class="toggle-icon">▶</span>
                </h4>
                <div class="collapsible-content collapsed">
                    <div class="structure-data-content">
        `;
        
        for (const [key, value] of Object.entries(node.data)) {
            nodeDetailsHTML += `<div><strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}</div>`;
        }
        
        nodeDetailsHTML += `
                    </div>
                </div>
            </div>
        `;
    }
    
    // Update the selected node container
    selectedNodeContainer.innerHTML = nodeDetailsHTML;
    
    // Show the node tools container since we have a selected node
    nodeToolsContainer.style.display = 'block';
    
    // Update the available actions based on node type and configuration
    const inputsList = document.getElementById('inputs-list');
    if (inputsList) {
        const hasSettings = node.configuration && node.configuration.settings;
        const settings = hasSettings ? node.configuration.settings : {};
        
        // Check if node has any supported tool settings
        const hasTools = hasSettings && (
            settings.use_rss_feed || 
            settings.use_file_input || 
            settings.allow_automation || 
            settings.require_human_review
        );
        
        if (hasTools) {
            let actionsHTML = `
                <div class="input-item">
                    <h3>${nodeName} Tools</h3>
                    <div class="input-content">
                        <strong>Available Tools:</strong><br>
                        ${settings.use_rss_feed ? '• RSS Feed<br>' : ''}
                        ${settings.use_file_input ? '• File Input<br>' : ''}
                        ${settings.allow_automation ? '• Automation<br>' : ''}
                        ${settings.require_human_review ? '• Human Review Required<br>' : ''}
                    </div>
                    <div class="input-meta">Node ID: ${nodeId}</div>
                </div>
            `;
            
            inputsList.innerHTML = actionsHTML;
        } else {
            inputsList.innerHTML = '<p class="empty-state">This node does not have any configured tools or actions, but you can still use the available tools below.</p>';
        }
        
        // Always show all tool sections when a node is selected, regardless of node configuration
        document.querySelectorAll('#node-tools-container .collapsible-section').forEach(section => {
            section.style.display = 'block';
        });
    }
}