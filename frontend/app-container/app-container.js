/**
 * App Container Component
 * Provides functionality for creating and managing the main application container
 */
import { removeElementWithAnimation, addElementWithAnimation } from '../animation/animation.js';

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
 * Clear the contents of the app container with animation
 * @param {function} callback - Optional callback to run after clearing
 * @returns {HTMLElement} The container element
 */
export function clearAppContainer(callback = null) {
    const container = getAppContainer();
    const children = Array.from(container.children);
    
    // If no children, just run callback and return
    if (children.length === 0) {
        if (callback) callback();
        return container;
    }
    
    // Track how many animations are in progress
    let animationsRemaining = children.length;
    
    // Function to call when an animation is complete
    const animationDone = () => {
        animationsRemaining--;
        if (animationsRemaining === 0 && callback) {
            callback();
        }
    };
    
    // Remove each child with animation
    children.forEach(child => {
        removeElementWithAnimation(child, 'fade-out', animationDone);
    });
    
    return container;
}

/**
 * Set the content of the app container with animation
 * @param {string|HTMLElement} content - HTML content or element to set
 * @param {string} animationClass - Animation class to use (default: 'fade-in')
 * @returns {HTMLElement} The container element
 */
export function setAppContainerContent(content, animationClass = 'fade-in') {
    const container = getAppContainer();
    
    // Clear the container first with animation
    clearAppContainer(() => {
        if (typeof content === 'string') {
            // Create a wrapper for the HTML content
            const wrapper = document.createElement('div');
            wrapper.innerHTML = content;
            
            // Add the wrapper with animation
            addElementWithAnimation(wrapper, container, animationClass);
        } else if (content instanceof HTMLElement) {
            // Add the element with animation
            addElementWithAnimation(content, container, animationClass);
        }
    });
    
    return container;
}

// Export default object with all functions
export default {
    createAppContainer,
    getAppContainer,
    clearAppContainer,
    setAppContainerContent
};