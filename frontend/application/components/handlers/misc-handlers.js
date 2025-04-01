/**
 * Miscellaneous handlers for logout and Johto functionality
 */
import * as api from '../api.js';
import { showNotification, showError, getLoadingAnimation } from './common.js';

/**
 * Setup logout handler
 */
export function setupLogoutHandler() {
    const logoutButton = document.querySelector('.logout-btn');
    logoutButton?.addEventListener('click', async () => {
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
    const johtoButton = document.querySelector('.johto-btn');
    johtoButton?.addEventListener('click', async () => {
        try {
            // Disable button and show basic button loading state
            johtoButton.disabled = true;
            johtoButton.textContent = 'Loading...';
            
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
                showNotification('Johto data downloaded successfully', 'success');
            } else {
                throw new Error(response.message || 'Failed to download Johto data');
            }
        } catch (error) {
            // Hide the loading animation in case of error
            getLoadingAnimation().hide();
            showError('Error downloading Johto data', error);
        } finally {
            // Reset button state
            johtoButton.disabled = false;
            johtoButton.textContent = 'Johto';
        }
    });
}