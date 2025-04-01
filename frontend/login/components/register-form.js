import { createFormField } from './form-field.js';

export function createRegisterForm() {
    const form = document.createElement('form');
    form.id = 'register-form';
    form.className = 'auth-form';
    
    const nameField = createFormField('text', 'register-name', 'Username', 'Enter your username', 'name');
    const emailField = createFormField('email', 'register-email', 'Email Address', 'Enter your email', 'email');
    const passwordField = createFormField('password', 'register-password', 'Password', 'Create a password', 'new-password');
    const confirmPasswordField = createFormField('password', 'register-confirm-password', 'Confirm Password', 'Confirm your password', 'new-password');
    
    form.appendChild(nameField);
    form.appendChild(emailField);
    form.appendChild(passwordField);
    form.appendChild(confirmPasswordField);
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn-primary';
    submitButton.textContent = 'Create Account';
    
    form.appendChild(submitButton);
    
    return form;
}