import * as api from '../api.js';
import { appState, showNotification, showError, getLoadingAnimation } from './common.js';

export function setupJobsTabHandlers() {
    const johtoDataBtn = document.getElementById('johto-data-btn');
    johtoDataBtn?.addEventListener('click', async () => {
        try {
            johtoDataBtn.disabled = true;
            johtoDataBtn.textContent = 'Loading...';
            
            const loadingAnimation = getLoadingAnimation();
            loadingAnimation.show();
            
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 100) progress = 100;
                loadingAnimation.updateProgress(progress);
            }, 600);
            
            const response = await api.loadJohtoData();
            
            clearInterval(progressInterval);
            
            loadingAnimation.updateProgress(100);
            
            await new Promise(resolve => setTimeout(resolve, 400));
            
            loadingAnimation.hide();
            
            if (response.status === 'success') {
                showNotification('Johto data loaded successfully', 'success');
                
                if (response.data && response.data.structures) {
                    updateStructuresList(response.data.structures);
                } else {
                    updateStructuresList([]);
                }
            } else {
                throw new Error(response.message || 'Failed to load Johto data');
            }
        } catch (error) {
            getLoadingAnimation().hide();
            showError('Error loading Johto data', error);
        } finally {
            johtoDataBtn.disabled = false;
            johtoDataBtn.textContent = 'Load johto.online data';
        }
    });
    
    document.getElementById('jobs-tab')?.addEventListener('click', () => {
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
        structureElement.className = 'job-card';
        structureElement.dataset.structureId = structure.id;
        
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
    
    document.querySelectorAll('.select-structure-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            selectStructure(structures[index]);
        });
    });
}

function selectStructure(structure) {
    appState.currentStructure = structure;
    showNotification(`Selected structure: ${structure.name}`, 'success');
    
    appState.currentJob = {
        id: structure.id,
        name: structure.name
    };
}