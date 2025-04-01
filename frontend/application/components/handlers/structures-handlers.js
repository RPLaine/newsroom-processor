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
    
    // Iterate through each user's structures
    Object.keys(structures).forEach(userId => {
        const userData = structures[userId];
        const username = userData.username || 'Unknown User';
        const userStructures = userData.structures || {};
        
        // Add a user section heading
        const userHeading = document.createElement('h3');
        userHeading.className = 'user-heading';
        userHeading.textContent = username;
        structuresList.appendChild(userHeading);
        
        // Create a container for this user's structures
        const userStructuresContainer = document.createElement('div');
        userStructuresContainer.className = 'user-structures-container';
        structuresList.appendChild(userStructuresContainer);
        
        if (Object.keys(userStructures).length === 0) {
            const noStructuresMsg = document.createElement('p');
            noStructuresMsg.className = 'empty-state';
            noStructuresMsg.textContent = 'No structures available for this user.';
            userStructuresContainer.appendChild(noStructuresMsg);
            return;
        }
        
        // Iterate through each structure file for this user
        Object.keys(userStructures).forEach(fileName => {
            const structure = userStructures[fileName];
            
            const structureElement = document.createElement('div');
            structureElement.className = 'structure-card';
            structureElement.dataset.structureId = fileName;
            
            const nodeCount = structure.nodes ? Object.keys(structure.nodes).length : 0;
            const structureName = structure.name || fileName.replace('.json', '');
            
            structureElement.innerHTML = `
                <div class="structure-content">
                    <h3>${structureName}</h3>
                    <div class="structure-meta">
                        <span class="structure-meta-item">File: ${fileName}</span>
                        <span class="structure-meta-item">Nodes: ${nodeCount}</span>
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