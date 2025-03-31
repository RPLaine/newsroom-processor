/**
 * Creates the login form component
 * 
 * @returns {HTMLElement} The login form element
 */
import { createFormField } from './form-field.js';

export function createLoginForm() {
    // Create login form
    const loginForm = document.createElement('form');
    loginForm.id = 'login-form';
    
    // Add email field
    loginForm.appendChild(createFormField('login-email', 'Email', 'email'));
    
    // Add password field
    loginForm.appendChild(createFormField('login-password', 'Password', 'password'));
    
    // Add login button
    const loginButton = document.createElement('button');
    loginButton.type = 'submit';
    loginButton.className = 'btn btn-primary';
    loginButton.textContent = 'Log In';
    loginForm.appendChild(loginButton);
    
    // Add error message container
    const loginError = document.createElement('p');
    loginError.className = 'error-message';
    loginError.id = 'login-error';
    loginForm.appendChild(loginError);
    
    return loginForm;
}