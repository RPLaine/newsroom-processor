import { createApplicationUI } from './appBuilder.js';
import { initEventHandlers } from './handlers.js';
import appState from './state.js';

export async function createApp(data, container) {
    console.log('Initializing app with data:', data);
    
    container.innerHTML = '';
    
    createApplicationUI(container);
    
    initEventHandlers();
    
    appState.userData = data;
    
    return data;
}