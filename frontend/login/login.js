import { createLoginContainer } from './components/login-container.js';
import { setupFormHandlers } from './components/form-handlers.js';
import { initAnimationSystem } from '../animation/animation.js';

async function createLogin(data, appContainer, FetchData) {
    // Add login-specific classes to body and app-container
    document.body.classList.add('login-page');
    appContainer.classList.add('login-view');
    
    appContainer.innerHTML = '';
    appContainer.appendChild(createLoginContainer());
    
    setupFormHandlers(FetchData);
    
    // Initialize animation system for login page
    initAnimationSystem();
    
    return data;
}

export default {
    createLogin
};