import { createApplicationUI } from './appBuilder.js';
import { initEventHandlers } from './handlers.js';
import appState from './state.js';
import * as api from './api.js';

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
            console.log('Johto data loaded successfully');
            
            if (response.data && response.data.structures) {
                console.log('===== JOHTO STRUCTURES DATA RECEIVED FROM BACKEND =====');
                console.log('Full structures data:', response.data.structures);
                
                // Log the number of users
                const userCount = Object.keys(response.data.structures).length;
                console.log(`Number of users with structures: ${userCount}`);
                
                // Log summary of each user's structures
                for (const userId in response.data.structures) {
                    const userData = response.data.structures[userId];
                    const username = userData.username || 'Unknown User';
                    const userStructures = userData.structures || {};
                    const structureCount = Object.keys(userStructures).length;
                    
                    console.log(`User: ${username} (${userId}) - ${structureCount} structures`);
                    
                    // Log details of each structure including node counts
                    console.log(`  Structures for user ${username}:`);
                    for (const structureKey in userStructures) {
                        const structure = userStructures[structureKey];
                        const structureName = structure.name || structureKey.replace('.json', '');
                        
                        let nodeCount = structure.structure?.nodes?.length;
                        let connectionCount = structure.structure?.connections?.length;
                        console.log(`    Structure: ${structureName} - ${nodeCount} nodes - ${connectionCount} connections`);
                    }
                }
                console.log('===== END OF JOHTO STRUCTURES DATA =====');
                
                appState.structures = response.data.structures;
                
                // Update structures list if we're on the structures tab
                if (appState.activeTab === 'structures') {
                    const event = new CustomEvent('johto-data-loaded');
                    document.dispatchEvent(event);
                }
            } else {
                console.warn('No structures data found in response:', response);
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