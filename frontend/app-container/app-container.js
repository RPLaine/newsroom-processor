/**
 * App Container Component
 * Provides functionality for creating and managing the main application container
 */

/**
 * Create and append the app container to the document body
 * @returns {HTMLElement} The created app container element
 */
export function createAppContainer() {
    const existingContainer = document.getElementById('app-container');
    if (existingContainer) return existingContainer;
    
    const appContainer = document.createElement('div');
    appContainer.id = 'app-container';
    document.body.appendChild(appContainer);
    return appContainer;
}

/**
 * Get the app container element or create it if it doesn't exist
 * @returns {HTMLElement} The app container element
 */
export function getAppContainer() {
    return document.getElementById('app-container') || createAppContainer();
}

/**
 * Clear the contents of the app container
 */
export function clearAppContainer() {
    const container = getAppContainer();
    container.innerHTML = '';
    return container;
}

/**
 * Set the content of the app container
 * @param {string|HTMLElement} content - HTML content or element to set
 */
export function setAppContainerContent(content) {
    const container = getAppContainer();
    
    if (typeof content === 'string') {
        container.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        clearAppContainer();
        container.appendChild(content);
    }
    
    return container;
}

// Export default object with all functions
export default {
    createAppContainer,
    getAppContainer,
    clearAppContainer,
    setAppContainerContent
};