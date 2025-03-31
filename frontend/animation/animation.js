/**
 * Animation Utilities
 * Helper functions for working with animations when adding/removing content
 */

/**
 * Add an element to the DOM with animation
 * 
 * @param {HTMLElement} element - The element to add
 * @param {HTMLElement} container - The container to add the element to
 * @param {string} animationClass - The animation class to use (defaults to 'animate-add')
 * @param {function} callback - Optional callback to run after animation completes
 */
export function addElementWithAnimation(element, container, animationClass = 'animate-add', callback = null) {
    // Set initial opacity to 0
    element.style.opacity = '0';
    
    // Add to container
    container.appendChild(element);
    
    // Force reflow to ensure animation starts properly
    void element.offsetWidth;
    
    // Add animation class
    element.classList.add(animationClass);
    element.style.opacity = '';
    
    // Handle callback after animation completes
    if (callback) {
        element.addEventListener('animationend', function handler() {
            callback();
            element.removeEventListener('animationend', handler);
        });
    }
    
    return element;
}

/**
 * Remove an element from the DOM with animation
 * 
 * @param {HTMLElement} element - The element to remove
 * @param {string} animationClass - The animation class to use (defaults to 'animate-remove')
 * @param {function} callback - Optional callback to run after animation completes
 */
export function removeElementWithAnimation(element, animationClass = 'animate-remove', callback = null) {
    // Add animation class
    element.classList.add(animationClass);
    
    // Remove element after animation completes
    element.addEventListener('animationend', function handler() {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        
        if (callback) {
            callback();
        }
        
        element.removeEventListener('animationend', handler);
    });
    
    return element;
}

/**
 * Toggle element visibility with animation
 * 
 * @param {HTMLElement} element - The element to toggle
 * @param {boolean} show - Whether to show or hide the element
 * @param {function} callback - Optional callback to run after animation completes
 */
export function toggleElementWithAnimation(element, show, callback = null) {
    if (show) {
        // Make sure element is in the DOM but hidden
        element.classList.remove('hidden');
        element.classList.add('showing');
        
        element.addEventListener('animationend', function handler() {
            element.classList.remove('showing');
            element.classList.add('visible');
            
            if (callback) {
                callback();
            }
            
            element.removeEventListener('animationend', handler);
        });
    } else {
        element.classList.add('hiding');
        element.classList.remove('visible');
        
        element.addEventListener('animationend', function handler() {
            element.classList.add('hidden');
            element.classList.remove('hiding');
            
            if (callback) {
                callback();
            }
            
            element.removeEventListener('animationend', handler);
        });
    }
}

/**
 * Apply staggered animations to a collection of elements
 * 
 * @param {NodeList|Array} elements - Collection of elements to animate
 * @param {string} animationClass - The animation class to apply (defaults to 'animated')
 * @param {number} staggerDelay - Delay between each element's animation in ms (defaults to 100)
 */
export function staggeredAnimation(elements, animationClass = 'animated', staggerDelay = 100) {
    Array.from(elements).forEach((element, index) => {
        setTimeout(() => {
            element.classList.add(animationClass);
        }, index * staggerDelay);
    });
}

// Export a default object with all animation utilities
export default {
    addElementWithAnimation,
    removeElementWithAnimation,
    toggleElementWithAnimation,
    staggeredAnimation
};