import { initEventHandlers } from './handlers/index.js';
import { createApplicationUI } from './appBuilder.js';
import * as api from './api.js';
import appState from './state.js';
import { initCollapsibleSections, initButtonHandlers, initFormHandlers } from './ui.js';
import { initAnimationSystem } from '../../animation/animation.js';

export async function createApp(data, container) {
    console.log('Initializing app with data:', data);
    
    const loadingAnimation = window.johtoLoadingAnimation;
    container.innerHTML = '';
    
    createApplicationUI(container);
    initEventHandlers();
    
    // Initialize UI systems after DOM is fully created
    setTimeout(() => {
        initCollapsibleSections();
        initAnimationSystem();
        initButtonHandlers();
        initFormHandlers();
    }, 0);
    
    appState.userData = data;
    
    try {
        const response = await api.loadJohtoData();
        
        if (response.status === 'success') {
            if (response.data && response.data.structures) {
                console.log('Structures: ', response.data.structures);
                appState.structures = response.data.structures;
                
                if (appState.activeTab === 'structures') {
                    const event = new CustomEvent('johto-data-loaded');
                    document.dispatchEvent(event);
                }
            } else {
                console.warn('No structures data found in response:', response);
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
        console.error('Error loading Johto data:', error);
        if (loadingAnimation) {
            loadingAnimation.hide();
        }
    }
}