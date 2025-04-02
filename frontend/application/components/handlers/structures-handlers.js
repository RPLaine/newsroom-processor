import { appState, showNotification, showError, getLoadingAnimation } from './common.js';
import { switchTab } from '../ui.js';
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
        
        userHeading.addEventListener('click', () => {
            userStructuresContainer.classList.toggle('collapsed');
            const toggleIcon = userHeading.querySelector('.toggle-icon');
            if (toggleIcon) {
                toggleIcon.textContent = userStructuresContainer.classList.contains('collapsed') ? '▶' : '▼';
            }
        });
        
        Object.keys(userStructures).forEach(fileName => {
            const structure = userStructures[fileName];
            
            const structureElement = document.createElement('div');
            structureElement.className = 'structure-card';
            structureElement.dataset.structureId = fileName;
            
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
                    <button class="btn select-structure-btn primary">Select</button>
                </div>
            `;
            
            userStructuresContainer.appendChild(structureElement);
            
            const selectBtn = structureElement.querySelector('.select-structure-btn');
            if (selectBtn) {
                selectBtn.addEventListener('click', () => {
                    selectStructure({
                        id: fileName,
                        name: structureName,
                        userId: userId,
                        username: username,
                        ...structure
                    });
                });
            }
        });
    });
}

function selectStructure(structure) {
    appState.currentStructure = structure;
    showNotification(`Selected structure: ${structure.name}`, 'success');
    switchTab('inputs');
    updateStructureInfo();
}