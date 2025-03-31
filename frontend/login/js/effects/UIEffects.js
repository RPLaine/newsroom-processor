/**
 * UIEffects.js - Manages UI animation effects and visual enhancements
 * Provides methods for creating engaging visual feedback
 */

export class UIEffects {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }
    
    /**
     * Initialize audio context for subtle sound effects
     */
    initAudio() {
        // Only add audio if browser supports AudioContext
        if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
            return;
        }
        
        try {
            // Create audio context
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
            
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
     * Add profound button behavior that transforms button text
     * on hover to create a sense of destiny and importance
     * @param {HTMLElement} button - Button to enhance
     * @param {string} defaultText - Default button text
     * @param {string} destinyText - Text to show on hover
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
     * Show a message in the specified element
     * @param {HTMLElement} element - Message container element
     * @param {string} message - Message to display
     * @param {string} type - Message type (success/error)
     */
    showMessage(element, message, type) {
        if (!element) return;
        
        element.textContent = message;
        element.className = 'auth-message';
        element.classList.add(type);
        element.style.opacity = '0';
        
        // Fade in
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    }
    
    /**
     * Apply shake animation to indicate error
     * @param {HTMLElement} element - Element to shake
     */
    shakeElement(element) {
        if (!element) return;
        
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 600);
    }
    
    /**
     * Highlight input field with error
     * @param {string} inputId - ID of input element
     */
    highlightInputError(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        input.classList.add('input-error');
        input.focus();
        
        // Remove error highlight after user starts typing
        const removeError = () => {
            input.classList.remove('input-error');
            input.removeEventListener('input', removeError);
        };
        
        input.addEventListener('input', removeError);
    }
    
    /**
     * Update button to show loading state
     * @param {HTMLElement} button - Button element
     * @param {boolean} isLoading - Whether button is in loading state
     */
    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.innerHTML = '<span class="loading-spinner"></span> Connecting...';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }
    
    /**
     * Apply celebratory visual effect for successful registration
     * @param {HTMLElement} button - Button element to emanate celebration from
     */
    celebrateCreation(button) {
        if (!button) return;
        
        // Create starburst effect
        const container = button.closest('.auth-form');
        if (container) {
            const stars = 12;
            for (let i = 0; i < stars; i++) {
                const star = document.createElement('div');
                star.className = 'celebration-star';
                
                // Position and angle
                const angle = (i / stars) * Math.PI * 2;
                const distance = 50 + Math.random() * 50;
                const duration = 600 + Math.random() * 400;
                const size = 5 + Math.random() * 10;
                
                Object.assign(star.style, {
                    position: 'absolute',
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: 'rgba(255, 204, 0, 0.8)',
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: '1',
                    zIndex: '100',
                    transition: `all ${duration}ms cubic-bezier(0.165, 0.84, 0.44, 1)`
                });
                
                container.appendChild(star);
                
                // Trigger animation
                setTimeout(() => {
                    Object.assign(star.style, {
                        transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`,
                        opacity: '0'
                    });
                }, 10);
                
                // Remove element after animation
                setTimeout(() => {
                    if (star.parentNode) {
                        star.parentNode.removeChild(star);
                    }
                }, duration + 100);
            }
        }
    }
    
    /**
     * Show encouraging message near a form button
     * @param {HTMLElement} form - Form to add message to
     */
    showEncouragingMessage(form) {
        if (!form) return;
        
        const button = form.querySelector('.auth-button');
        if (!button || !button.parentNode) return;
        
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