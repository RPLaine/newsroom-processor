/**
 * index.js - Main entry point for the modular login system
 * Orchestrates the initialization of all components
 */
import { authService } from './core/AuthService.js';
import { FormManager } from './components/FormManager.js';
import { StorytellingManager } from './components/StorytellingManager.js';
import { WebGPUBackgroundManager } from './effects/WebGPUBackgroundManager.js';

/**
 * LoginApplication - Main application class that coordinates all modules
 */
class LoginApplication {
    constructor() {
        this.formManager = new FormManager();
        this.storytellingManager = new StorytellingManager();
        this.backgroundManager = new WebGPUBackgroundManager();
    }

    /**
     * Initialize the login application
     */
    async initialize() {
        console.log('Initializing modular login system...');
        
        // Initialize form handling
        this.formManager.initialize();
        console.log('Form manager initialized');
        
        // Initialize storytelling elements
        this.storytellingManager.initialize();
        console.log('Storytelling manager initialized');
        
        // Initialize WebGPU background
        const backgroundSuccess = await this.backgroundManager.initialize('background-canvas');
        console.log(`WebGPU background initialization: ${backgroundSuccess ? 'successful' : 'using fallback'}`);
        
        // Check authentication state
        authService.checkAuthentication().then(isAuthenticated => {
            console.log('Authentication state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
        });
    }
}

// Create and initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const app = new LoginApplication();
    app.initialize();
});