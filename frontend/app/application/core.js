import appState from './state.js';
import { showNotification, showError, navigateToView } from './utils.js';

/**
 * Initialize the application
 * 
 * @param {Object} options - Application initialization options
 * @returns {Promise<void>}
 */
async function initApp(options = {}) {
    const { theme = 'default', initialView = 'dashboard', fetchData } = options;
    
    // Set app state
    appState.isInitialized = true;
    appState.sessionStartTime = Date.now();
    
    // Apply theme
    document.body.dataset.theme = theme;
    localStorage.setItem('gamegen2-theme', theme);
    
    // Navigate to initial view
    navigateToView(initialView);
    
    // Register event listeners
    registerEventListeners();
    
    return;
}

/**
 * Register all event listeners for the application
 */
function registerEventListeners() {
    // Navigation
    document.querySelectorAll('[data-navigate]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.dataset.navigate;
            navigateToView(view);
        });
    });
    
    // Theme switcher
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            document.body.dataset.theme = theme;
            localStorage.setItem('gamegen2-theme', theme);
            showNotification(`Theme changed to ${theme}`);
        });
    });
    
    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        // Handle logout logic
        window.location.href = '/auth/logout';
    });
    
    // Create story button
    document.getElementById('new-story-btn')?.addEventListener('click', () => {
        navigateToView('create');
    });
    
    // Create story form
    document.getElementById('create-story-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prompt = document.getElementById('story-prompt').value;
        const genre = document.getElementById('story-genre').value;
        
        if (!prompt) {
            showError('Please enter a prompt for your story');
            return;
        }
        
        navigateToView('story');
        // Story creation logic would be handled here
    });
}

/**
 * Load user session data
 * 
 * @param {Function} fetchData - The data fetching function
 * @returns {Promise<Object>} User session data
 */
async function loadUserSession(fetchData) {
    try {
        const response = await fetchData({
            action: 'get_user_session'
        });
        
        if (response.status === 'success') {
            return response.data;
        } else {
            throw new Error(response.message || 'Failed to load user session');
        }
    } catch (error) {
        showError('Session loading failed', error);
        return {};
    }
}

export { initApp, registerEventListeners, loadUserSession };