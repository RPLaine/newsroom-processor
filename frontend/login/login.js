/**
 * GameGen2 Login Module
 * 
 * This module handles user authentication including login and registration.
 * It's loaded when a user is not authenticated.
 */
import { createLoginContainer } from './components/login-container.js';
import { setupFormHandlers } from './components/form-handlers.js';

/**
 * Initialize the login module
 * 
 * @param {Object} data - Initial data from server
 * @param {HTMLElement} appContainer - The app container element
 * @param {Function} FetchData - The data fetching function
 * @returns {Promise<Object>} Updated data after login
 */
async function createLogin(data, appContainer, FetchData) {

    appContainer.innerHTML = '';
    appContainer.appendChild(createLoginContainer());
    
    setupFormHandlers(FetchData);
    
    return data;
}

// Export the functionality
export default {
    createLogin
};