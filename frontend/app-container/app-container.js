import { removeElementWithAnimation, addElementWithAnimation } from '../animation/animation.js';

export function createAppContainer() {
    const existingContainer = document.getElementById('app-container');
    if (existingContainer) return existingContainer;
    
    const appContainer = document.createElement('div');
    appContainer.id = 'app-container';
    document.body.appendChild(appContainer);
    return appContainer;
}

export function getAppContainer() {
    return document.getElementById('app-container') || createAppContainer();
}

export function clearAppContainer(callback = null) {
    const container = getAppContainer();
    const children = Array.from(container.children);
    
    if (children.length === 0) {
        if (callback) callback();
        return container;
    }
    
    let animationsRemaining = children.length;
    
    const animationDone = () => {
        animationsRemaining--;
        if (animationsRemaining === 0 && callback) {
            callback();
        }
    };
    
    children.forEach(child => {
        removeElementWithAnimation(child, 'fade-out', animationDone);
    });
    
    return container;
}

export function setAppContainerContent(content, animationClass = 'fade-in') {
    const container = getAppContainer();
    
    clearAppContainer(() => {
        if (typeof content === 'string') {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = content;
            
            addElementWithAnimation(wrapper, container, animationClass);
        } else if (content instanceof HTMLElement) {
            addElementWithAnimation(content, container, animationClass);
        }
    });
    
    return container;
}

export default {
    createAppContainer,
    getAppContainer,
    clearAppContainer,
    setAppContainerContent
};