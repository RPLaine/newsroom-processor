import { createTabs, createTabContent } from './tabs.js';
import { createLoginForm } from './login-form.js';
import { createRegisterForm } from './register-form.js';

export function createLoginContainer() {
    const loginContainer = document.createElement('div');
    loginContainer.className = 'login-container card';
    
    const title = document.createElement('h1');
    title.textContent = 'AI Processor Agent';
    loginContainer.appendChild(title);
    
    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';
    loginContainer.appendChild(formContainer);
    
    formContainer.appendChild(createTabs());
    
    const loginTabContent = createTabContent('login', true);
    loginTabContent.appendChild(createLoginForm());
    formContainer.appendChild(loginTabContent);
    
    const registerTabContent = createTabContent('register');
    registerTabContent.appendChild(createRegisterForm());
    formContainer.appendChild(registerTabContent);
    
    return loginContainer;
}