/**
 * Creates the registration form component
 * 
 * @returns {HTMLElement} The registration form element
 */
import { createFormField } from './form-field.js';

export function createRegisterForm() {
    // Create register form
    const registerForm = document.createElement('form');
    registerForm.id = 'register-form';
    
    // Add email field
    registerForm.appendChild(createFormField('register-email', 'Email', 'email'));
    
    // Add password field
    registerForm.appendChild(createFormField('register-password', 'Password', 'password'));
    
    // Add confirm password field
    registerForm.appendChild(createFormField('register-confirm', 'Confirm Password', 'password'));
    
    // Add register button
    const registerButton = document.createElement('button');
    registerButton.type = 'submit';
    registerButton.className = 'btn btn-primary';
    registerButton.textContent = 'Register';
    registerForm.appendChild(registerButton);
    
    // Add error message container
    const registerError = document.createElement('p');
    registerError.className = 'error-message';
    registerError.id = 'register-error';
    registerForm.appendChild(registerError);
    
    return registerForm;
}