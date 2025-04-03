/**
 * Miscellaneous handlers for logout and Johto functionality
 */
import * as api from '../api.js';
import { showError } from '../../components/ui.js';
import { registerButtonHandler } from '../ui.js';
import LoadingAnimation from '../../../animation/loading-animation.js';

// Create Johto loading animation
let johtoLoadingAnimation;
function getLoadingAnimation() {
    if (!johtoLoadingAnimation) {
        johtoLoadingAnimation = new LoadingAnimation({
            colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#7B1FA2'],
            particleCount: 150,
            showText: true,
            text: 'Downloading Johto data...',
            showPercentage: false,
            speed: 1.2,
            pulseSpeed: 0.8
        });
        johtoLoadingAnimation.init();
    }
    return johtoLoadingAnimation;
}

/**
 * Setup logout handler
 */
export function setupLogoutHandler() {
    // Register centralized handler for logout button
    registerButtonHandler('logout-btn', async (event, button) => {
        try {
            await api.logout();
        } catch (error) {
            showError('Error logging out', error);
        }
    });
}

/**
 * Setup Johto button handler
 */
export function setupJohtoButtonHandler() {
    // Register centralized handler for Johto button
    registerButtonHandler('johto-btn', async (event, button) => {
        try {
            // Disable button and show basic button loading state
            button.disabled = true;
            button.textContent = 'Loading...';
            
            // Get and show our beautiful loading animation
            const johtoLoadingAnimation = getLoadingAnimation();
            johtoLoadingAnimation.show();
            
            // Simulate progress updates (since we don't have actual progress data)
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += Math.random() * 15; // Random progress increments
                if (progress > 100) progress = 100;
                johtoLoadingAnimation.updateProgress(progress);
            }, 600);
            
            const response = await api.loadJohtoData();
            
            // Clear the progress interval
            clearInterval(progressInterval);
            
            // Complete the progress to 100%
            johtoLoadingAnimation.updateProgress(100);
            
            // Small delay to show 100% completion before hiding
            await new Promise(resolve => setTimeout(resolve, 400));
            
            // Hide the loading animation
            johtoLoadingAnimation.hide();
            
            if (response.status === 'success') {
                console.log('Johto data downloaded successfully');
            } else {
                throw new Error(response.message || 'Failed to download Johto data');
            }
        } catch (error) {
            // Hide the loading animation in case of error
            getLoadingAnimation().hide();
            showError('Error downloading Johto data', error);
        } finally {
            // Reset button state
            button.disabled = false;
            button.textContent = 'Johto';
        }
    });
}