/**
 * Application entry module
 * 
 * Clean, structured application with 4 tabs:
 * 1. Jobs - Create or load document jobs
 * 2. Inputs - Manage job inputs (web search, RSS, files)
 * 3. Process - Interact with AI assistant
 * 4. Outputs - View and create output files
 */
import { createApplicationUI } from './appBuilder.js';
import { initEventHandlers } from './handlers.js';
import appState from './state.js';

/**
 * Create and initialize app
 * 
 * @param {Object} data - Initial data
 * @param {HTMLElement} container - Container element
 * @returns {Promise<Object>} Updated app data
 */
export async function createApp(data, container) {
    console.log('Initializing app with data:', data);
    
    // Clear container
    container.innerHTML = '';
    
    // Add UI components directly to the app-container
    createApplicationUI(container);
    
    // Initialize event handlers
    initEventHandlers();
    
    // Store user data
    appState.userData = data;
    
    return data;
}