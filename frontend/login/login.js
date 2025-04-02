import { createLoginContainer } from './components/login-container.js';
import { setupFormHandlers } from './components/form-handlers.js';
import { initAnimationSystem } from '../animation/animation.js';
import { initButtonHandlers, initFormHandlers } from '../application/components/ui.js';

async function createLogin(data, appContainer, FetchData) {
    // Add login-specific classes to body and app-container
    document.body.classList.add('login-page');
    appContainer.classList.add('login-view');
    
    appContainer.innerHTML = '';
    appContainer.appendChild(createLoginContainer());
    
    setupFormHandlers(FetchData);
    
    // Initialize UI systems for login page
    initAnimationSystem();
    initButtonHandlers(); 
    initFormHandlers();
    
    return data;
}

export default {
    createLogin
};