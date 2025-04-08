import appState from '../../components/state.js';
import { showError, switchTab, registerButtonHandler } from '../../components/ui.js';
import LoadingAnimation from '../../../animation/loading-animation.js';
import { updateStructureInfo } from './inputs-handlers.js';
import { resetProcessTab } from './process-handlers.js';
import * as api from '../api.js';

let johtoLoadingAnimation;
function getLoadingAnimation() {
    if (!johtoLoadingAnimation) {
        johtoLoadingAnimation = new LoadingAnimation({
            colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#7B1FA2'],
            particleCount: 150,
            showText: true,
            text: 'Downloading Johto data...',
            showPercentage: false,
            speed: 1.2,
            pulseSpeed: 0.8
        });
        johtoLoadingAnimation.init();
    }
    return johtoLoadingAnimation;
}

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
    
    // Handler for the select button
    registerButtonHandler('select-structure-btn', (event, button) => {
        event.stopPropagation(); // Prevent triggering the card click
        const structureCard = button.closest('.structure-card');
        if (!structureCard || !structureCard.dataset.item) return;
        
        selectStructure(JSON.parse(structureCard.dataset.item));
    });
    
    // Add a document listener for structure card clicks
    document.addEventListener('click', (event) => {
        const structureCard = event.target.closest('.structure-card[data-item]');
        if (!structureCard || event.target.closest('button')) return; // Skip if clicking on a button
        
        if (structureCard.dataset.item) {
            selectStructure(JSON.parse(structureCard.dataset.item));
        }
    });
    
    registerButtonHandler('refresh-structures-btn', async () => {
        try {
            const loadingAnimation = getLoadingAnimation();
            loadingAnimation.show();
            
            const response = await api.loadJohtoData();
            
            if (response.status === 'success' && response.data && response.data.structures) {
                appState.structures = response.data.structures;
                updateStructuresList(appState.structures);
                console.log('Structures refreshed successfully');
            } else {
                throw new Error(response.message || 'Failed to refresh structures');
            }
        } catch (error) {
            showError('Error refreshing structures', error);
        } finally {
            const loadingAnimation = getLoadingAnimation();
            loadingAnimation.hide();
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
        
        Object.keys(userStructures).forEach(fileName => {
            const structure = userStructures[fileName];
            
            const structureElement = document.createElement('div');
            structureElement.className = 'structure-card';
            
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
            `;
            
            userStructuresContainer.appendChild(structureElement);
        });
    });
}

function selectStructure(structure) {
    // Clear any previous structure data 
    if (appState.currentStructure && appState.currentStructure.id !== structure.id) {
        appState.nodeHistory = [];
    }
    
    appState.currentStructure = structure;
    console.log(`Selected structure: ${structure.name}`);
    
    resetProcessTab();
    
    // Switch to 'process' tab instead of 'inputs'
    switchTab('process');
    updateStructureInfo();
}