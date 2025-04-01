import { createFormField } from './form-field.js';

export function createLoginForm() {
    const form = document.createElement('form');
    form.id = 'login-form';
    form.className = 'auth-form';
    
    const emailField = createFormField('email', 'email', 'Email Address', 'Enter your email');
    const passwordField = createFormField('password', 'password', 'Password', 'Enter your password');
    
    form.appendChild(emailField);
    form.appendChild(passwordField);
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'auth-button';
    submitButton.textContent = 'Sign In';
    
    form.appendChild(submitButton);
    
    return form;
}