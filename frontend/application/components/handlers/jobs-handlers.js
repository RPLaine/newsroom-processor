/**
 * Jobs tab event handlers
 */
import * as api from '../api.js';
import { appState, showNotification, showError, getLoadingAnimation } from './common.js';

/**
 * Setup event handlers for Jobs tab
 */
export function setupJobsTabHandlers() {
    // Setup Johto data button handler
    const johtoDataBtn = document.getElementById('johto-data-btn');
    johtoDataBtn?.addEventListener('click', async () => {
        try {
            // Disable button and show loading state
            johtoDataBtn.disabled = true;
            johtoDataBtn.textContent = 'Loading...';
            
            // Get and show loading animation
            const loadingAnimation = getLoadingAnimation();
            loadingAnimation.show();
            
            // Simulate progress updates
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 100) progress = 100;
                loadingAnimation.updateProgress(progress);
            }, 600);
            
            const response = await api.loadJohtoData();
            
            // Clear the progress interval
            clearInterval(progressInterval);
            
            // Complete the progress to 100%
            loadingAnimation.updateProgress(100);
            
            // Small delay to show 100% completion before hiding
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Hide the loading animation
            loadingAnimation.hide();
            
            if (response.status === 'success') {
                showNotification('Johto data loaded successfully', 'success');
                
                // Update structures list if data is available
                if (response.data && response.data.structures) {
                    updateStructuresList(response.data.structures);
                } else {
                    updateStructuresList([]);
                }
            } else {
                throw new Error(response.message || 'Failed to load Johto data');
            }
        } catch (error) {
            // Hide the loading animation in case of error
            getLoadingAnimation().hide();
            showError('Error loading Johto data', error);
        } finally {
            // Reset button state
            johtoDataBtn.disabled = false;
            johtoDataBtn.textContent = 'Load johto.online data';
        }
    });
    
    // Load structures when jobs tab is clicked
    document.getElementById('jobs-tab')?.addEventListener('click', () => {
        // If structures data exists in the current app state, display it
        if (appState.structures && appState.structures.length > 0) {
            updateStructuresList(appState.structures);
        }
    });
}

/**
 * Update structures list in UI
 * 
 * @param {Array} structures - Structures data from API
 */
function updateStructuresList(structures) {
    const structuresList = document.getElementById('structures-list');
    if (!structuresList) return;
    
    // Store structures in app state for future reference
    appState.structures = structures;
    
    if (!structures || structures.length === 0) {
        structuresList.innerHTML = '<p>No structures loaded. Please load johto.online data first.</p>';
        return;
    }
    
    structuresList.innerHTML = '';
    
    structures.forEach(structure => {
        const structureElement = document.createElement('div');
        structureElement.className = 'job-card';
        structureElement.dataset.structureId = structure.id;
        
        // Get number of nodes if available
        const nodeCount = structure.nodes ? Object.keys(structure.nodes).length : 0;
        
        structureElement.innerHTML = `
            <div class="job-content">
                <h3>${structure.name || 'Untitled Structure'}</h3>
                <div class="job-meta">
                    <span>ID: ${structure.id}</span>
                    <span>Nodes: ${nodeCount}</span>
                </div>
            </div>
            <div class="job-actions">
                <button class="btn select-structure-btn primary">Select</button>
            </div>
        `;
        
        structuresList.appendChild(structureElement);
    });
    
    // Add event listeners to structure buttons
    document.querySelectorAll('.select-structure-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            selectStructure(structures[index]);
        });
    });
}

/**
 * Select a structure and load its data
 * 
 * @param {Object} structure - Structure data
 */
function selectStructure(structure) {
    appState.currentStructure = structure;
    showNotification(`Selected structure: ${structure.name}`, 'success');
    
    // For now, just set the current job to the selected structure
    // In the future, this could be expanded to handle structure-specific functionality
    appState.currentJob = {
        id: structure.id,
        name: structure.name
    };
}