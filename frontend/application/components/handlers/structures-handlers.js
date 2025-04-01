// filepath: c:\git\gamegen2\frontend\application\components\handlers\structures-handlers.js
import * as api from '../api.js';
import { appState, showNotification, showError, getLoadingAnimation } from './common.js';

export function setupStructuresTabHandlers() {
    // Listen for the johto-data-loaded event
    document.addEventListener('johto-data-loaded', () => {
        if (appState.structures && appState.structures.length > 0) {
            updateStructuresList(appState.structures);
        }
    });
    
    // Update structures list when switching to structures tab
    document.getElementById('structures-tab')?.addEventListener('click', () => {
        if (appState.structures && appState.structures.length > 0) {
            updateStructuresList(appState.structures);
        }
    });
}

function updateStructuresList(structures) {
    const structuresList = document.getElementById('structures-list');
    if (!structuresList) return;
    
    appState.structures = structures;
    
    if (!structures || structures.length === 0) {
        structuresList.innerHTML = '<p>No structures loaded. Please load johto.online data first.</p>';
        return;
    }
    
    structuresList.innerHTML = '';
    
    structures.forEach(structure => {
        const structureElement = document.createElement('div');
        structureElement.className = 'structure-card';
        structureElement.dataset.structureId = structure.id;
        
        const nodeCount = structure.nodes ? Object.keys(structure.nodes).length : 0;
        
        structureElement.innerHTML = `
            <div class="structure-content">
                <h3>${structure.name || 'Untitled Structure'}</h3>
                <div class="structure-meta">
                    <span>ID: ${structure.id}</span>
                    <span>Nodes: ${nodeCount}</span>
                </div>
            </div>
            <div class="structure-actions">
                <button class="btn select-structure-btn primary">Select</button>
            </div>
        `;
        
        structuresList.appendChild(structureElement);
    });
    
    document.querySelectorAll('.select-structure-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            selectStructure(structures[index]);
        });
    });
}

function selectStructure(structure) {
    appState.currentStructure = structure;
    showNotification(`Selected structure: ${structure.name}`, 'success');
}