import { appState, showNotification, showError, getLoadingAnimation } from './common.js';
import { switchTab, registerButtonHandler } from '../ui.js';
import { updateStructureInfo } from './inputs-handlers.js';

export function setupStructuresTabHandlers() {
    document.addEventListener('johto-data-loaded', () => {
        if (appState.structures) {
            updateStructuresList(appState.structures);
        }
    });
    
    document.getElementById('structures-tab')?.addEventListener('click', () => {
        if (appState.structures) {
            updateStructuresList(appState.structures);
        }
    });
    
    // Register centralized button handler for structure selection
    registerButtonHandler('select-structure-btn', (event, button) => {
        const structureCard = button.closest('.structure-card');
        if (!structureCard || !structureCard.dataset.item) return;
        
        selectStructure(JSON.parse(structureCard.dataset.item));
    });
}

function updateStructuresList(structures) {
    const structuresList = document.getElementById('structures-list');
    if (!structuresList) return;
    
    appState.structures = structures;
    
    if (!structures || Object.keys(structures).length === 0) {
        structuresList.innerHTML = '<p class="empty-state">No structures loaded. Please load johto.online data first.</p>';
        return;
    }
    
    structuresList.innerHTML = '';
    
    const usersWithStructures = Object.keys(structures)
        .map(userId => {
            const userData = structures[userId];
            const username = userData.username || 'Unknown User';
            const userStructures = userData.structures || {};
            const structureCount = Object.keys(userStructures).length;
            
            return {
                userId,
                username,
                userStructures,
                structureCount
            };
        })
        .filter(user => user.structureCount > 0)
        .sort((a, b) => b.structureCount - a.structureCount);
    
    usersWithStructures.forEach(({ userId, username, userStructures }) => {
        const userSection = document.createElement('div');
        userSection.className = 'collapsible-section';
        structuresList.appendChild(userSection);
        
        const userHeading = document.createElement('h3');
        userHeading.className = 'collapsible-heading';
        userHeading.innerHTML = `${username} (${Object.keys(userStructures).length}) <span class="toggle-icon">▶</span>`;
        userSection.appendChild(userHeading);
        
        const userStructuresContainer = document.createElement('div');
        userStructuresContainer.className = 'collapsible-content collapsed';
        userSection.appendChild(userStructuresContainer);
        
        Object.keys(userStructures).forEach(fileName => {
            const structure = userStructures[fileName];
            
            const structureElement = document.createElement('div');
            structureElement.className = 'structure-card';
            
            // Store structure data as a JSON string in a data attribute
            const structureData = {
                id: fileName,
                name: structure.name || fileName.replace('.json', ''),
                userId: userId,
                username: username,
                ...structure
            };
            structureElement.dataset.item = JSON.stringify(structureData);
            
            let nodeCount = 0;
            let connectionCount = 0;
            
            // ... existing code for counting nodes and connections ...
            
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
            
            const structureName = structure.name || fileName.replace('.json', '');
            
            structureElement.innerHTML = `
                <div class="structure-content">
                    <h3>${structureName}</h3>
                    <div class="structure-meta">
                        <span class="structure-meta-item">Nodes: ${nodeCount}</span>
                        <span class="structure-meta-item">Connections: ${connectionCount}</span>
                    </div>
                </div>
                <div class="structure-actions">
                    <button class="btn select-structure-btn primary" data-button-type="select-structure-btn">Select</button>
                </div>
            `;
            
            userStructuresContainer.appendChild(structureElement);
            
            // Remove individual click handler - handled by the centralized system now
        });
    });
}

function selectStructure(structure) {
    appState.currentStructure = structure;
    showNotification(`Selected structure: ${structure.name}`, 'success');
    switchTab('inputs');
    updateStructureInfo();
}