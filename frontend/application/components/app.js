import { createApplicationUI } from './appBuilder.js';
import { initEventHandlers } from './handlers.js';
import appState from './state.js';
import * as api from './api.js';
import { showNotification, showError } from './ui.js';

export async function createApp(data, container) {
    console.log('Initializing app with data:', data);
    
    container.innerHTML = '';
    
    createApplicationUI(container);
    
    initEventHandlers();
    
    appState.userData = data;
    
    // Automatically load Johto data when the app starts
    try {
        console.log('Loading Johto data automatically...');
        const response = await api.loadJohtoData();
        
        if (response.status === 'success') {
            showNotification('Johto data loaded automatically', 'success');
            
            if (response.data && response.data.structures) {
                appState.structures = response.data.structures;
                
                // Update structures list if we're on the structures tab
                if (appState.activeTab === 'structures') {
                    const event = new CustomEvent('johto-data-loaded');
                    document.dispatchEvent(event);
                }
            }
        } else {
            console.error('Failed to load Johto data:', response.message);
        }
    } catch (error) {
        console.error('Error automatically loading Johto data:', error);
    }
    
    return data;
}