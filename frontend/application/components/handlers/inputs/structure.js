import { appState } from '../../common.js';

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