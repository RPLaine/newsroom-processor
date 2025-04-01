export function addElementWithAnimation(element, container, animationClass = 'animate-add', callback = null) {
    element.style.opacity = '0';
    
    container.appendChild(element);
    
    void element.offsetWidth;
    
    element.classList.add(animationClass);
    element.style.opacity = '';
    
    if (callback) {
        element.addEventListener('animationend', function handler() {
            callback();
            element.removeEventListener('animationend', handler);
        });
    }
    
    return element;
}

export function removeElementWithAnimation(element, animationClass = 'animate-remove', callback = null) {
    element.classList.add(animationClass);
    
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

export function toggleElementWithAnimation(element, show, callback = null) {
    if (show) {
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

export function staggeredAnimation(elements, animationClass = 'animated', staggerDelay = 100) {
    Array.from(elements).forEach((element, index) => {
        setTimeout(() => {
            element.classList.add(animationClass);
        }, index * staggerDelay);
    });
}

export default {
    addElementWithAnimation,
    removeElementWithAnimation,
    toggleElementWithAnimation,
    staggeredAnimation
};