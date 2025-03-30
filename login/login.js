/**
 * Enhanced login and registration functionality for GameGen2
 * Focused on immersive storytelling experience
 */
class AuthManager {
    constructor() {
        this.initialized = false;
        this.authState = {
            authenticated: false,
            user_id: null
        };
        this.storyPrompts = [
            "What if you could reshape reality with your thoughts?",
            "In a world where dreams become tangible...",
            "When ancient magic meets modern technology...",
            "Discover universes beyond imagination...",
            "Every choice creates a new timeline...",
            "What lies beyond the veil of perception?",
            "Your story is waiting to be written...",
            "This moment could change everything...",
            "The journey of a thousand worlds begins with a single choice...",
            "Unlock the door to infinite possibilities..."
        ];
        this.isAnimating = false; // Track animation state to prevent multiple clicks during transition
        this.animationDuration = 300; // Duration for animations in ms
        this.hasInteracted = false; // Track if user has interacted with form
    }

    /**
     * Initialize the login UI components with enhanced storytelling elements
     */
    initialize() {
        if (this.initialized) return;
        
        // Create login container content if it doesn't exist
        const loginContainer = document.getElementById('login-container');
        if (!loginContainer) return;
        
        // Initialize storytelling elements
        this.initializeStorytellingElements();
        
        // Tab switching functionality
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginTab && registerTab) {
            // Tab switching event listeners with enhanced animation transitions
            loginTab.addEventListener('click', () => {
                if (this.isAnimating || loginTab.classList.contains('active')) return;
                this.switchToForm('login', loginTab, registerTab, loginForm, registerForm);
            });
            
            registerTab.addEventListener('click', () => {
                if (this.isAnimating || registerTab.classList.contains('active')) return;
                this.switchToForm('register', registerTab, loginTab, registerForm, loginForm);
            });
        }
        
        // Login form submission with enhanced feedback
        const loginFormElement = document.getElementById('login-form');
        if (loginFormElement) {
            // Add profound button text transformation
            const loginButton = loginFormElement.querySelector('.auth-button');
            if (loginButton) {
                this.addProfoundButtonBehavior(loginButton, "Begin Journey", "Continue Your Destiny");
            }
            
            loginFormElement.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const messageElement = document.getElementById('login-message');
                const submitButton = loginFormElement.querySelector('.auth-button');
                
                // Basic validation
                if (!email || !password) {
                    this.showMessage(messageElement, 'Please fill in all fields', 'error');
                    this.shakeElement(messageElement);
                    return;
                }
                
                // Update button to show loading state
                this.setButtonLoading(submitButton, true);
                
                // Send login request
                this.login(email, password, messageElement, submitButton);
            });
        }
        
        // Registration form submission with enhanced feedback
        const registerFormElement = document.getElementById('register-form');
        if (registerFormElement) {
            // Add profound button text transformation
            const registerButton = registerFormElement.querySelector('.auth-button');
            if (registerButton) {
                this.addProfoundButtonBehavior(registerButton, "Start Creating", "Transform Your Reality");
            }
            
            registerFormElement.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm-password').value;
                const messageElement = document.getElementById('register-message');
                const submitButton = registerFormElement.querySelector('.auth-button');
                
                // Basic validation with improved feedback
                if (!email || !password || !confirmPassword) {
                    this.showMessage(messageElement, 'Please fill in all fields', 'error');
                    this.shakeElement(messageElement);
                    return;
                }
                
                if (password !== confirmPassword) {
                    this.showMessage(messageElement, 'Passwords do not match', 'error');
                    this.shakeElement(messageElement);
                    this.highlightInputError('register-confirm-password');
                    return;
                }
                
                if (password.length < 8) {
                    this.showMessage(messageElement, 'Password must be at least 8 characters long', 'error');
                    this.shakeElement(messageElement);
                    this.highlightInputError('register-password');
                    return;
                }
                
                // Update button to show loading state
                this.setButtonLoading(submitButton, true);
                
                // Send registration request
                this.register(email, password, messageElement, submitButton);
            });
        }
        
        // Add form interaction tracking
        this.addFormInteractionTracking();
        
        // Initialize forms with proper transitions
        if (loginForm && loginForm.classList.contains('active')) {
            loginForm.style.opacity = '1';
            loginForm.style.transform = 'translateX(0)';
            loginForm.style.position = 'relative'; // Reset position for initial form
        }
        if (registerForm) {
            registerForm.style.opacity = registerForm.classList.contains('active') ? '1' : '0';
            registerForm.style.transform = registerForm.classList.contains('active') ? 'translateX(0)' : 'translateX(20px)';
            if (registerForm.classList.contains('active')) {
                registerForm.style.position = 'relative'; // Reset position for initial form
            }
        }
        
        // Add atmospheric audio effects if supported
        this.initializeAtmosphericAudio();
        
        this.initialized = true;
    }
    
    /**
     * Add form interaction tracking to enhance user experience
     * as they progress toward the life-changing button click
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
                            // Subtle glow enhancement
                            button.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.35), 0 0 35px rgba(255, 204, 0, 0.25)';
                        }
                    }
                }
            });
            
            // Show encouraging message when user starts typing
            input.addEventListener('input', () => {
                if (input.value.length > 0) {
                    // Find the parent form
                    const form = input.closest('.auth-form');
                    if (!form) return;
                    
                    // Check if we should show destiny message (only once per session)
                    if (!form.hasAttribute('data-shown-message')) {
                        form.setAttribute('data-shown-message', 'true');
                        
                        // Add encouraging message near the button
                        const button = form.querySelector('.auth-button');
                        if (button && button.parentNode) {
                            const messageEl = document.createElement('div');
                            messageEl.className = 'destiny-message';
                            messageEl.textContent = form.id === 'login-form' ? 
                                "Your stories await your return..." : 
                                "You're just moments away from unlimited creativity...";
                            
                            Object.assign(messageEl.style, {
                                fontSize: '0.9rem',
                                color: 'rgba(255, 204, 0, 0.8)',
                                textAlign: 'center',
                                margin: '0.5rem 0 1rem',
                                opacity: '0',
                                transform: 'translateY(10px)',
                                transition: 'opacity 1s ease, transform 1s ease'
                            });
                            
                            button.parentNode.insertBefore(messageEl, button);
                            
                            // Animate in
                            setTimeout(() => {
                                messageEl.style.opacity = '1';
                                messageEl.style.transform = 'translateY(0)';
                            }, 100);
                            
                            // Remove after a while
                            setTimeout(() => {
                                messageEl.style.opacity = '0';
                                messageEl.style.transform = 'translateY(-10px)';
                                
                                setTimeout(() => {
                                    if (messageEl.parentNode) {
                                        messageEl.parentNode.removeChild(messageEl);
                                    }
                                }, 1000);
                            }, 8000);
                        }
                    }
                }
            });
        });
    }
    
    /**
     * Add profound button behavior that transforms button text
     * on hover to create a sense of destiny and importance
     */
    addProfoundButtonBehavior(button, defaultText, destinyText) {
        if (!button) return;
        
        button.addEventListener('mouseenter', () => {
            // Save original text if not already saved
            if (!button.hasAttribute('data-original-text')) {
                button.setAttribute('data-original-text', button.textContent);
            }
            
            // Create text transition effect
            button.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            // Subtle scale effect
            button.style.transform = 'translateY(-3px) scale(1.02)';
            
            // Text fade out/in effect
            button.style.opacity = '0.8';
            setTimeout(() => {
                button.textContent = destinyText;
                button.style.opacity = '1';
            }, 200);
        });
        
        button.addEventListener('mouseleave', () => {
            // Revert text with fade effect
            button.style.opacity = '0.8';
            
            setTimeout(() => {
                if (button.hasAttribute('data-original-text')) {
                    button.textContent = button.getAttribute('data-original-text');
                } else {
                    button.textContent = defaultText;
                }
                button.style.opacity = '1';
                
                // Reset transform if not changed elsewhere
                if (button.style.transform === 'translateY(-3px) scale(1.02)') {
                    button.style.transform = '';
                }
            }, 200);
        });
    }

    /**
     * Initialize subtle background audio effects 
     * for a more immersive experience
     */
    initializeAtmosphericAudio() {
        // Only add audio if browser supports AudioContext
        if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
            return;
        }
        
        try {
            // Create audio context
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContextClass();
            
            // Store for later use
            this.audioContext = audioCtx;
            
            // Add subtle audio feedback on important interactions
            document.querySelectorAll('.auth-button').forEach(button => {
                button.addEventListener('mouseenter', () => this.playAudioEffect('hover'));
                button.addEventListener('click', () => this.playAudioEffect('click'));
            });
            
            document.querySelectorAll('.auth-tab').forEach(tab => {
                tab.addEventListener('click', () => this.playAudioEffect('tab'));
            });
        } catch (error) {
            console.log('Advanced audio effects not supported');
        }
    }
    
    /**
     * Play subtle audio effect for interactive elements
     * @param {string} type - Type of effect to play
     */
    playAudioEffect(type) {
        if (!this.audioContext) return;
        
        try {
            // Resume audio context if suspended (browser policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Create oscillator
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Set type and frequency based on interaction
            switch(type) {
                case 'hover':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(
                        660, this.audioContext.currentTime + 0.1
                    );
                    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(
                        0.001, this.audioContext.currentTime + 0.3
                    );
                    break;
                    
                case 'click':
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(330, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(
                        550, this.audioContext.currentTime + 0.1
                    );
                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(
                        0.001, this.audioContext.currentTime + 0.5
                    );
                    break;
                    
                case 'tab':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(520, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(
                        440, this.audioContext.currentTime + 0.15
                    );
                    gainNode.gain.setValueAtTime(0.07, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(
                        0.001, this.audioContext.currentTime + 0.25
                    );
                    break;
            }
            
            // Connect and start
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.start();
            
            // Stop after effect completes
            setTimeout(() => {
                oscillator.stop();
            }, type === 'click' ? 500 : 300);
            
        } catch (error) {
            // Silent fail for audio effects
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
        const currentHeight = formContainer.offsetHeight;
        
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
    
    /**
     * Initialize storytelling elements that enhance the login experience
     */
    initializeStorytellingElements() {
        // Dynamically update the storytelling text periodically
        this.cycleStoryPrompts();
        
        // Add profound hover state to storytelling text
        const storyText = document.querySelector('.storytelling-text p');
        if (storyText) {
            // Apply more dramatic styles on hover
            storyText.addEventListener('mouseenter', () => {
                storyText.style.textShadow = '0 0 20px rgba(255, 204, 0, 0.4)';
                storyText.style.transform = 'scale(1.01)';
                storyText.style.transition = 'all 0.7s ease';
            });
            
            storyText.addEventListener('mouseleave', () => {
                storyText.style.textShadow = '';
                storyText.style.transform = '';
            });
        }
    }
    
    /**
     * Cycle through story prompts in the storytelling text
     */
    cycleStoryPrompts() {
        const storyPromptElement = document.querySelector('.storytelling-text p');
        if (!storyPromptElement) return;
        
        let currentIndex = 0;
        
        // Set initial text
        storyPromptElement.textContent = this.storyPrompts[currentIndex];
        
        // Cycle prompts every 8 seconds
        setInterval(() => {
            // Fade out
            storyPromptElement.style.opacity = 0;
            
            // Change text after fade out
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % this.storyPrompts.length;
                storyPromptElement.textContent = this.storyPrompts[currentIndex];
                
                // Fade in
                storyPromptElement.style.opacity = 1;
            }, 500);
        }, 8000);
    }

    /**
     * Check the authentication state of the user.
     * @returns {Promise<boolean>} - Resolves to true if authenticated, false otherwise.
     */
    checkAuthentication() {
        return new Promise((resolve) => {
            // Simulate an asynchronous check (e.g., API call)
            setTimeout(() => {
                resolve(this.authState.authenticated);
            }, 500); // Simulated delay
        });
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Initialize auth on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // First initialize auth manager
    authManager.initialize();
    
    // Then check authentication state
    authManager.checkAuthentication().then(isAuthenticated => {
        console.log('Authentication state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
    });
});