import { createFormField } from './form-field.js';

export function createRegisterForm() {
    const form = document.createElement('form');
    form.id = 'register-form';
    form.className = 'auth-form';
    
    const nameField = createFormField('text', 'name', 'Full Name', 'Enter your full name');
    const emailField = createFormField('email', 'email', 'Email Address', 'Enter your email');
    const passwordField = createFormField('password', 'password', 'Password', 'Create a password');
    const confirmPasswordField = createFormField('password', 'confirm-password', 'Confirm Password', 'Confirm your password');
    
    form.appendChild(nameField);
    form.appendChild(emailField);
    form.appendChild(passwordField);
    form.appendChild(confirmPasswordField);
    
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'auth-button';
    submitButton.textContent = 'Create Account';
    
    form.appendChild(submitButton);
    
    return form;
}