/**
 * FormManager.js - Manages login and registration form interactions
 * Handles form validation, submission, and UI state
 */
import { authService } from '../core/AuthService.js';
import { UIEffects } from '../effects/UIEffects.js';
import { FormValidator } from '../utils/FormValidator.js';

export class FormManager {
    constructor() {
        this.initialized = false;
        this.isAnimating = false;
        this.hasInteracted = false;
        this.animationDuration = 300;
        this.uiEffects = new UIEffects();
        this.validator = new FormValidator();
    }

    /**
     * Initialize form event listeners and UI enhancements
     */
    initialize() {
        if (this.initialized) return;
        
        // Setup tab switching
        this.setupTabSwitching();
        
        // Setup form submissions
        this.setupLoginForm();
        this.setupRegisterForm();
        
        // Track form interactions
        this.addFormInteractionTracking();
        
        // Position forms correctly
        this.positionForms();
        
        this.initialized = true;
    }
    
    /**
     * Setup tab switching between login and register forms
     */
    setupTabSwitching() {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginTab && registerTab) {
            loginTab.addEventListener('click', () => {
                if (this.isAnimating || loginTab.classList.contains('active')) return;
                this.switchToForm('login', loginTab, registerTab, loginForm, registerForm);
            });
            
            registerTab.addEventListener('click', () => {
                if (this.isAnimating || registerTab.classList.contains('active')) return;
                this.switchToForm('register', registerTab, loginTab, registerForm, loginForm);
            });
        }
    }
    
    /**
     * Setup login form validation and submission
     */
    setupLoginForm() {
        const loginFormElement = document.getElementById('login-form');
        if (loginFormElement) {
            // Add enhanced button behavior
            const loginButton = loginFormElement.querySelector('.auth-button');
            if (loginButton) {
                this.uiEffects.addProfoundButtonBehavior(loginButton, "Begin Journey", "Continue Your Destiny");
            }
            
            loginFormElement.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const messageElement = document.getElementById('login-message');
                const submitButton = loginFormElement.querySelector('.auth-button');
                
                // Validate form
                if (!this.validator.validateLoginForm(email, password, messageElement)) {
                    this.uiEffects.shakeElement(messageElement);
                    return;
                }
                
                // Show loading state
                this.uiEffects.setButtonLoading(submitButton, true);
                
                // Send login request
                authService.login(email, password)
                    .then(data => {
                        // Reset button state
                        this.uiEffects.setButtonLoading(submitButton, false);
                        
                        if (data.status === 'success') {
                            // Show success message
                            this.uiEffects.showMessage(messageElement, 'Your journey continues...', 'success');
                            
                            // Redirect after a moment
                            setTimeout(() => {
                                window.location.href = data.redirect || '/';
                            }, 1500);
                        } else {
                            // Show error message
                            this.uiEffects.showMessage(messageElement, data.message || 'The path is blocked. Try again.', 'error');
                            this.uiEffects.shakeElement(messageElement);
                        }
                    })
                    .catch(error => {
                        console.error('Login error:', error);
                        this.uiEffects.setButtonLoading(submitButton, false);
                        this.uiEffects.showMessage(messageElement, 'A mysterious force prevented connection. Try again.', 'error');
                        this.uiEffects.shakeElement(messageElement);
                    });
            });
        }
    }
    
    /**
     * Setup registration form validation and submission
     */
    setupRegisterForm() {
        const registerFormElement = document.getElementById('register-form');
        if (registerFormElement) {
            // Add enhanced button behavior
            const registerButton = registerFormElement.querySelector('.auth-button');
            if (registerButton) {
                this.uiEffects.addProfoundButtonBehavior(registerButton, "Start Creating", "Transform Your Reality");
            }
            
            registerFormElement.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm-password').value;
                const messageElement = document.getElementById('register-message');
                const submitButton = registerFormElement.querySelector('.auth-button');
                
                // Validate form
                if (!this.validator.validateRegisterForm(email, password, confirmPassword, messageElement)) {
                    this.uiEffects.shakeElement(messageElement);
                    return;
                }
                
                // Show loading state
                this.uiEffects.setButtonLoading(submitButton, true);
                
                // Send registration request
                authService.register(email, password)
                    .then(data => {
                        // Reset button state
                        this.uiEffects.setButtonLoading(submitButton, false);
                        
                        if (data.status === 'success') {
                            // Show success message
                            this.uiEffects.showMessage(messageElement, 'Your creative journey begins!', 'success');
                            
                            // Add celebration effect
                            this.uiEffects.celebrateCreation(submitButton);
                            
                            // Redirect after a moment
                            setTimeout(() => {
                                window.location.href = data.redirect || '/';
                            }, 2000);
                        } else {
                            // Show error message
                            this.uiEffects.showMessage(messageElement, data.message || 'A cosmic disturbance occurred. Try again.', 'error');
                            this.uiEffects.shakeElement(messageElement);
                        }
                    })
                    .catch(error => {
                        console.error('Registration error:', error);
                        this.uiEffects.setButtonLoading(submitButton, false);
                        this.uiEffects.showMessage(messageElement, 'The universe failed to respond. Try again soon.', 'error');
                        this.uiEffects.shakeElement(messageElement);
                    });
            });
        }
    }
    
    /**
     * Add form interaction tracking for enhanced user experience
     */
    addFormInteractionTracking() {
        // Track all input interactions
        const inputs = document.querySelectorAll('.form-group input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (!this.hasInteracted) {
                    this.hasInteracted = true;
                    
                    // Enhance button appearance after first interaction
                    const activeForm = document.querySelector('.auth-form.active');
                    if (activeForm) {
                        const button = activeForm.querySelector('.auth-button');
                        if (button) {
                            button.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.35), 0 0 35px rgba(255, 204, 0, 0.25)';
                        }
                    }
                }
            });
            
            input.addEventListener('input', () => {
                if (input.value.length > 0) {
                    const form = input.closest('.auth-form');
                    if (!form || form.hasAttribute('data-shown-message')) return;
                    
                    form.setAttribute('data-shown-message', 'true');
                    this.uiEffects.showEncouragingMessage(form);
                }
            });
        });
    }
    
    /**
     * Position forms correctly for initial render
     */
    positionForms() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm && loginForm.classList.contains('active')) {
            loginForm.style.opacity = '1';
            loginForm.style.transform = 'translateX(0)';
            loginForm.style.position = 'relative';
        }
        
        if (registerForm) {
            registerForm.style.opacity = registerForm.classList.contains('active') ? '1' : '0';
            registerForm.style.transform = registerForm.classList.contains('active') ? 'translateX(0)' : 'translateX(20px)';
            if (registerForm.classList.contains('active')) {
                registerForm.style.position = 'relative';
            }
        }
    }
    
    /**
     * Handle form switching with smooth animations
     * @param {string} formType - 'login' or 'register'
     * @param {HTMLElement} activeTab - Tab to activate
     * @param {HTMLElement} inactiveTab - Tab to deactivate
     * @param {HTMLElement} showForm - Form to show
     * @param {HTMLElement} hideForm - Form to hide
     */
    switchToForm(formType, activeTab, inactiveTab, showForm, hideForm) {
        this.isAnimating = true;
        
        // Calculate optimal height for the container during transition
        const formContainer = showForm.closest('.auth-form-container');
        const currentHeight = formContainer?.offsetHeight;
        
        // Update active tab styling
        activeTab.classList.add('active');
        inactiveTab.classList.remove('active');
        
        // Direction based on form type
        const direction = formType === 'login' ? 'Left' : 'Right';
        const inverseDirection = formType === 'login' ? 'Right' : 'Left';
        
        // Animate out current form
        hideForm.style.animation = `slideOut${inverseDirection} ${this.animationDuration}ms forwards ease`;
        
        // Wait for exit animation to complete
        setTimeout(() => {
            // Hide the old form and reset its animation
            hideForm.classList.remove('active');
            hideForm.style.animation = '';
            hideForm.style.opacity = '0';
            hideForm.style.position = 'absolute';
            
            // Show new form and prepare it for entrance
            showForm.classList.add('active');
            showForm.style.opacity = '0';
            showForm.style.position = 'relative';
            showForm.style.animation = `slideIn${direction} ${this.animationDuration}ms forwards ease`;
            
            // Animation complete
            setTimeout(() => {
                this.isAnimating = false;
                showForm.style.opacity = '1';
                showForm.style.transform = 'translateX(0)';
            }, this.animationDuration);
        }, this.animationDuration);
    }
}