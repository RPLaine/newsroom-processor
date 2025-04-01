/**
 * Inputs tab event handlers
 */
import * as api from '../api.js';
import { appState, showNotification, showError, formatDate } from './common.js';

/**
 * Setup event handlers for Inputs tab
 */
export function setupInputsTabHandlers() {
    // Web search form
    const webSearchForm = document.getElementById('web-search-form');
    webSearchForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
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
                
                // Update current job
                appState.currentJob = response.data.job;
                
                // Update inputs list
                updateInputsList(appState.currentJob.inputs);
                
                // Clear form
                document.getElementById('search-query').value = '';
            } else {
                throw new Error(response.message || 'Web search failed');
            }
        } catch (error) {
            showError('Error performing web search', error);
        }
    });
    
    // RSS form
    const rssForm = document.getElementById('rss-form');
    rssForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
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
                
                // Update current job
                appState.currentJob = response.data.job;
                
                // Update inputs list
                updateInputsList(appState.currentJob.inputs);
                
                // Clear form
                document.getElementById('rss-url').value = '';
            } else {
                throw new Error(response.message || 'RSS processing failed');
            }
        } catch (error) {
            showError('Error processing RSS feed', error);
        }
    });
    
    // File upload form
    const fileForm = document.getElementById('file-form');
    fileForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
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
            
            // Read file content
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
                        
                        // Update current job
                        appState.currentJob = response.data.job;
                        
                        // Update inputs list
                        updateInputsList(appState.currentJob.inputs);
                        
                        // Clear form
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

/**
 * Update inputs list in UI
 * 
 * @param {Array} inputs - Inputs data
 */
export function updateInputsList(inputs) {
    const inputsList = document.getElementById('inputs-list');
    if (!inputsList) return;
    
    if (!inputs || inputs.length === 0) {
        inputsList.innerHTML = '<p>No inputs added yet.</p>';
        return;
    }
    
    inputsList.innerHTML = '';
    
    inputs.forEach(input => {
        const inputElement = document.createElement('div');
        inputElement.className = 'input-item';
        
        // Format date
        const date = input.timestamp ? formatDate(new Date(input.timestamp * 1000)) : 'Unknown';
        
        let contentPreview = '';
        
        if (input.type === 'web_search') {
            contentPreview = `<strong>Query:</strong> ${input.query || 'Unknown'}<br>`;
            if (input.results && input.results.length > 0) {
                contentPreview += `<strong>Results:</strong><br>`;
                input.results.forEach(result => {
                    contentPreview += `• ${result.title || 'Unknown'}<br>`;
                });
            }
        } else if (input.type === 'rss_feed') {
            contentPreview = `<strong>Source:</strong> ${input.url || 'Unknown'}<br>`;
            if (input.items && input.items.length > 0) {
                contentPreview += `<strong>Items:</strong><br>`;
                input.items.forEach(item => {
                    contentPreview += `• ${item.title || 'Unknown'}<br>`;
                });
            }
        } else if (input.type === 'file') {
            contentPreview = `<strong>File:</strong> ${input.name || 'Unknown'}<br>`;
            const contentSample = input.content ? input.content.substring(0, 100) + '...' : 'No content';
            contentPreview += `<strong>Preview:</strong> ${contentSample}`;
        }
        
        inputElement.innerHTML = `
            <h3>${getInputTypeLabel(input.type)}</h3>
            <div class="input-content">${contentPreview}</div>
            <div class="input-meta">Added: ${date}</div>
        `;
        
        inputsList.appendChild(inputElement);
    });
}

/**
 * Get display label for input type
 * 
 * @param {string} type - Input type
 * @returns {string} Display label
 */
export function getInputTypeLabel(type) {
    switch (type) {
        case 'web_search': return 'Web Search';
        case 'rss_feed': return 'RSS Feed';
        case 'file': return 'File Upload';
        default: return 'Input';
    }
}