import * as api from '../../api.js';
import { appState, showNotification, showError } from '../../common.js';
import { registerFormHandler, registerButtonHandler } from '../../ui.js';
import { updateStructureInfo } from './structure.js';
import { updateInputsList } from './inputs.js';
import { selectNode } from './node.js';

export function setupInputsTabHandlers() {
    document.getElementById('inputs-tab')?.addEventListener('click', () => {
        updateStructureInfo();
    });
    
    // Register button handler for node selection
    registerButtonHandler('select-node-btn', (event, button) => {
        const structureCard = button.closest('.structure-card');
        if (!structureCard || !structureCard.dataset.node) return;
        
        selectNode(JSON.parse(structureCard.dataset.node));
    });
    
    // Register form handler for web search form
    registerFormHandler('web-search-form', async (event, form) => {
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            const query = document.getElementById('search-query').value;
            
            if (!query) {
                showError('Search query is required');
                return;
            }
            
            const response = await api.searchWeb(query, appState.currentJob.id);
            
            if (response.status === 'success' && response.data) {
                showNotification('Web search completed', 'success');
                
                appState.currentJob = response.data.job;
                
                updateInputsList(appState.currentJob.inputs);
                
                document.getElementById('search-query').value = '';
            } else {
                throw new Error(response.message || 'Web search failed');
            }
        } catch (error) {
            showError('Error performing web search', error);
        }
    });
    
    // Register form handler for RSS form
    registerFormHandler('rss-form', async (event, form) => {
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            const url = document.getElementById('rss-url').value;
            
            if (!url) {
                showError('RSS URL is required');
                return;
            }
            
            const response = await api.processRSS(url, appState.currentJob.id);
            
            if (response.status === 'success' && response.data) {
                showNotification('RSS feed processed', 'success');
                
                appState.currentJob = response.data.job;
                
                updateInputsList(appState.currentJob.inputs);
                
                document.getElementById('rss-url').value = '';
            } else {
                throw new Error(response.message || 'RSS processing failed');
            }
        } catch (error) {
            showError('Error processing RSS feed', error);
        }
    });
    
    // Register form handler for file upload form
    registerFormHandler('file-form', async (event, form) => {
        if (!appState.currentJob) {
            showError('Please select a job first');
            return;
        }
        
        try {
            const fileInput = document.getElementById('file-input');
            
            if (!fileInput.files || !fileInput.files[0]) {
                showError('Please select a file');
                return;
            }
            
            const file = fileInput.files[0];
            
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const fileContent = event.target.result;
                    
                    const response = await api.processFile(
                        file.name,
                        fileContent,
                        appState.currentJob.id
                    );
                    
                    if (response.status === 'success' && response.data) {
                        showNotification('File uploaded successfully', 'success');
                        
                        appState.currentJob = response.data.job;
                        
                        updateInputsList(appState.currentJob.inputs);
                        
                        fileInput.value = '';
                    } else {
                        throw new Error(response.message || 'File upload failed');
                    }
                } catch (error) {
                    showError('Error processing file', error);
                }
            };
            
            reader.readAsText(file);
        } catch (error) {
            showError('Error reading file', error);
        }
    });
}