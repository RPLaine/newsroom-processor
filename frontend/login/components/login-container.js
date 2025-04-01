/**
 * Creates the main login container with all subcomponents
 * 
 * @returns {HTMLElement} The login container element
 */
import { createTabs, createTabContent } from './tabs.js';
import { createLoginForm } from './login-form.js';
import { createRegisterForm } from './register-form.js';

export function createLoginContainer() {
    // Create main container
    const loginContainer = document.createElement('div');
    loginContainer.className = 'login-container card';
    
    // Create title
    const title = document.createElement('h1');
    title.textContent = 'AI Processor Agent';
    loginContainer.appendChild(title);
    
    // Create form container
    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';
    loginContainer.appendChild(formContainer);
    
    // Add tabs navigation
    formContainer.appendChild(createTabs());
    
    // Create login tab content (active by default)
    const loginTabContent = createTabContent('login', true);
    loginTabContent.appendChild(createLoginForm());
    formContainer.appendChild(loginTabContent);
    
    // Create register tab content
    const registerTabContent = createTabContent('register');
    registerTabContent.appendChild(createRegisterForm());
    formContainer.appendChild(registerTabContent);
    
    return loginContainer;
}