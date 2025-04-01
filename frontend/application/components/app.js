import { createApplicationUI } from './appBuilder.js';
import { initEventHandlers } from './handlers.js';
import appState from './state.js';
import * as api from './api.js';
import { showError } from './ui.js';

export async function createApp(data, container) {
    console.log('Initializing app with data:', data);
    
    // Access the loading animation from the window object
    const loadingAnimation = window.johtoLoadingAnimation;
    
    container.innerHTML = '';
    
    createApplicationUI(container);
    
    initEventHandlers();
    
    appState.userData = data;
    
    // Automatically load Johto data when the app starts
    try {
        console.log('Loading Johto data automatically...');
        const response = await api.loadJohtoData();
        
        if (response.status === 'success') {
            // No notification needed as the loading animation signals completion
            
            if (response.data && response.data.structures) {
                appState.structures = response.data.structures;
                
                // Update structures list if we're on the structures tab
                if (appState.activeTab === 'structures') {
                    const event = new CustomEvent('johto-data-loaded');
                    document.dispatchEvent(event);
                }
            }
            
            // Hide loading animation after structures are loaded
            if (loadingAnimation) {
                loadingAnimation.hide();
            }
        } else {
            console.error('Failed to load Johto data:', response.message);
            // Hide loading animation even if loading failed
            if (loadingAnimation) {
                loadingAnimation.hide();
            }
        }
    } catch (error) {
        console.error('Error automatically loading Johto data:', error);
        // Hide loading animation if there was an error
        if (loadingAnimation) {
            loadingAnimation.hide();
        }
    }
    
    return data;
}