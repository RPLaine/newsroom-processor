import { createFormField } from './form-field.js';

export function createLoginForm() {
    const form = document.createElement('form');
    form.id = 'login-form';
    form.className = 'auth-form';
    
    const emailField = createFormField('email', 'login-email', 'Email Address', 'Enter your email', 'username');
    const passwordField = createFormField('password', 'login-password', 'Password', 'Enter your password', 'current-password');
    
    form.appendChild(emailField);
    form.appendChild(passwordField);
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn-primary';
    submitButton.textContent = 'Sign In';
    
    form.appendChild(submitButton);
    
    return form;
}