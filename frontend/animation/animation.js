/**
 * Initialize the animation system with event delegation.
 * Sets up a single document-level event listener for animation events.
 */
export function initAnimationSystem() {
    // Remove existing listener if it exists (for reinitializations)
    document.removeEventListener('animationend', handleAnimationEnd);
    
    // Add a single document-level event listener
    document.addEventListener('animationend', handleAnimationEnd);
    
    console.log('Animation system initialized with event delegation');
}

/**
 * Central handler for animation end events using event delegation
 * @param {Event} event - The animation end event
 */
function handleAnimationEnd(event) {
    const element = event.target;
    
    // Handle add animation
    if (element.hasAttribute('data-animation-add')) {
        // Execute callback if provided
        const callbackId = element.getAttribute('data-animation-callback');
        if (callbackId && window[callbackId]) {
            window[callbackId]();
        }
        
        // Clean up attributes
        element.removeAttribute('data-animation-add');
        element.removeAttribute('data-animation-callback');
    }
    
    // Handle remove animation
    if (element.hasAttribute('data-animation-remove')) {
        // Remove the element
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        
        // Execute callback if provided
        const callbackId = element.getAttribute('data-animation-callback');
        if (callbackId && window[callbackId]) {
            window[callbackId]();
        }
        
        // No need to clean up attributes as element is removed
    }
    
    // Handle toggle show animation
    if (element.hasAttribute('data-animation-show')) {
        element.classList.remove('showing');
        element.classList.add('visible');
        
        // Execute callback if provided
        const callbackId = element.getAttribute('data-animation-callback');
        if (callbackId && window[callbackId]) {
            window[callbackId]();
        }
        
        // Clean up attributes
        element.removeAttribute('data-animation-show');
        element.removeAttribute('data-animation-callback');
    }
    
    // Handle toggle hide animation
    if (element.hasAttribute('data-animation-hide')) {
        element.classList.add('hidden');
        element.classList.remove('hiding');
        
        // Execute callback if provided
        const callbackId = element.getAttribute('data-animation-callback');
        if (callbackId && window[callbackId]) {
            window[callbackId]();
        }
        
        // Clean up attributes
        element.removeAttribute('data-animation-hide');
        element.removeAttribute('data-animation-callback');
    }
}

/**
 * Store a callback function in the window object with a unique ID
 * @param {Function} callback - The callback function to store
 * @returns {string} - The ID of the stored callback
 */
function storeCallback(callback) {
    if (!callback) return null;
    
    const callbackId = 'animationCallback_' + Math.random().toString(36).substr(2, 9);
    window[callbackId] = function() {
        callback();
        delete window[callbackId]; // Clean up after execution
    };
    
    return callbackId;
}

export function addElementWithAnimation(element, container, animationClass = 'animate-add', callback = null) {
    element.style.opacity = '0';
    
    container.appendChild(element);
    
    void element.offsetWidth;
    
    element.classList.add(animationClass);
    element.style.opacity = '';
    
    // Use data attribute instead of event listener
    if (callback) {
        element.setAttribute('data-animation-add', '');
        element.setAttribute('data-animation-callback', storeCallback(callback));
    }
    
    return element;
}

export function removeElementWithAnimation(element, animationClass = 'animate-remove', callback = null) {
    element.classList.add(animationClass);
    
    // Use data attribute instead of event listener
    element.setAttribute('data-animation-remove', '');
    if (callback) {
        element.setAttribute('data-animation-callback', storeCallback(callback));
    }
    
    return element;
}

export function toggleElementWithAnimation(element, show, callback = null) {
    if (show) {
        element.classList.remove('hidden');
        element.classList.add('showing');
        
        // Use data attribute instead of event listener
        element.setAttribute('data-animation-show', '');
        if (callback) {
            element.setAttribute('data-animation-callback', storeCallback(callback));
        }
    } else {
        element.classList.add('hiding');
        element.classList.remove('visible');
        
        // Use data attribute instead of event listener
        element.setAttribute('data-animation-hide', '');
        if (callback) {
            element.setAttribute('data-animation-callback', storeCallback(callback));
        }
    }
}

export function staggeredAnimation(elements, animationClass = 'animated', staggerDelay = 100) {
    Array.from(elements).forEach((element, index) => {
        setTimeout(() => {
            element.classList.add(animationClass);
        }, index * staggerDelay);
    });
}

export default {
    initAnimationSystem,
    addElementWithAnimation,
    removeElementWithAnimation,
    toggleElementWithAnimation,
    staggeredAnimation
};