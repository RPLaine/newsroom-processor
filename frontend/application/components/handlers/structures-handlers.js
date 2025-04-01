// filepath: c:\git\gamegen2\frontend\application\components\handlers\structures-handlers.js
import * as api from '../api.js';
import { appState, showNotification, showError, getLoadingAnimation } from './common.js';

export function setupStructuresTabHandlers() {
    // Listen for the johto-data-loaded event
    document.addEventListener('johto-data-loaded', () => {
        if (appState.structures) {
            updateStructuresList(appState.structures);
        }
    });
    
    // Update structures list when switching to structures tab
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
    
    // Filter out users with no structures and get structure counts
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
        .sort((a, b) => b.structureCount - a.structureCount); // Sort by most structures first
    
    // Iterate through sorted users with structures
    usersWithStructures.forEach(({ userId, username, userStructures }) => {
        // Create a container for this user section (heading + structures)
        const userSection = document.createElement('div');
        userSection.className = 'user-section';
        structuresList.appendChild(userSection);
        
        // Add a user section heading with toggle functionality
        const userHeading = document.createElement('h3');
        userHeading.className = 'user-heading';
        // Add an expand/collapse icon and structure count
        userHeading.innerHTML = `${username} (${Object.keys(userStructures).length}) <span class="toggle-icon">▶</span>`;
        userSection.appendChild(userHeading);
        
        // Create a container for this user's structures
        const userStructuresContainer = document.createElement('div');
        userStructuresContainer.className = 'user-structures-container collapsed';
        userSection.appendChild(userStructuresContainer);
        
        // Add event listener to toggle visibility
        userHeading.addEventListener('click', () => {
            userStructuresContainer.classList.toggle('collapsed');
            const toggleIcon = userHeading.querySelector('.toggle-icon');
            if (toggleIcon) {
                toggleIcon.textContent = userStructuresContainer.classList.contains('collapsed') ? '▶' : '▼';
            }
        });
        
        // Iterate through each structure file for this user
        Object.keys(userStructures).forEach(fileName => {
            const structure = userStructures[fileName];
            
            const structureElement = document.createElement('div');
            structureElement.className = 'structure-card';
            structureElement.dataset.structureId = fileName;
            
            // Correctly calculate node and connection counts
            // Ensure we're counting actual nodes and connections, not just object keys at the top level
            let nodeCount = 0;
            let connectionCount = 0;
            
            if (structure.nodes && typeof structure.nodes === 'object') {
                nodeCount = Object.keys(structure.nodes).length;
            }
            
            if (structure.connections && typeof structure.connections === 'object') {
                connectionCount = Object.keys(structure.connections).length;
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
            
            // Add event listener to the select button
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
}