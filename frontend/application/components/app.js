import { createApplicationUI } from './appBuilder.js';
import { initEventHandlers } from './handlers.js';
import appState from './state.js';
import * as api from './api.js';

export async function createApp(data, container) {
    const loadingAnimation = window.johtoLoadingAnimation;
    
    container.innerHTML = '';
    
    createApplicationUI(container);
    initEventHandlers();
    
    appState.userData = data;
    
    try {
        const response = await api.loadJohtoData();
        
        if (response.status === 'success') {
            if (response.data && response.data.structures) {
                console.log('Full structures data:', response.data.structures);
            }

            if (loadingAnimation) {
                loadingAnimation.hide();
            }
        } else {
            console.error('Failed to load Johto data:', response.message);
            if (loadingAnimation) {
                loadingAnimation.hide();
            }
        }
    } catch (error) {
        console.error('Error automatically loading Johto data:', error);
        if (loadingAnimation) {
            loadingAnimation.hide();
        }
    }
    
    return data;
}