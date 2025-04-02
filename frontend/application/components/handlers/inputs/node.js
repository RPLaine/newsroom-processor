import { appState, showNotification } from '../../common.js';

export function selectNode(node) {
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

export function updateSelectedNodeInfo() {
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