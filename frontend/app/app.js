/**
 * GameGen2 Main Application Module
 * 
 * This module serves as the main entry point for the application after user authentication.
 * It initializes all required modules and handles the application lifecycle.
 */

// Application state
const appState = {
    isInitialized: false,
    currentUser: null,
    currentView: 'dashboard',
    availableViews: ['dashboard', 'create', 'stories', 'settings'],
    sessionStartTime: null
};

/**
 * Initialize the application
 * 
 * @param {Object} options - Initialization options
 * @returns {Promise<void>}
 */
async function initApp(options = {}) {
    if (appState.isInitialized) {
        console.log('App already initialized');
        return;
    }
    
    console.log('Initializing GameGen2 application...');
    
    try {
        // Start session timer
        appState.sessionStartTime = Date.now();
        
        // Load current user from session
        await loadUserSession();
        
        // Initialize styling
        if (window.initStyling) {
            await window.initStyling({
                defaultTheme: options.theme || 'default'
            });
        } else {
            console.warn('Styling module not available');
        }
        
        // Initialize storytelling module
        if (window.initStorytelling) {
            await window.initStorytelling({
                genre: options.defaultGenre || 'fantasy',
                style: options.defaultStyle || 'descriptive',
                temperature: options.temperature || 0.7
            });
        } else {
            console.warn('Storytelling module not available');
        }
        
        // Register event listeners
        registerEventListeners();
        
        // Set up UI effects if available
        if (window.UIEffects && typeof window.UIEffects.initialize === 'function') {
            window.UIEffects.initialize();
        }
        
        // Set initial view
        navigateToView(options.initialView || 'dashboard');
        
        // Mark as initialized
        appState.isInitialized = true;
        
        console.log('Application initialized successfully');
        
        // Dispatch app ready event
        window.dispatchEvent(new Event('app:ready'));
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to initialize application', error);
    }
}

/**
 * Register global event listeners
 */
function registerEventListeners() {
    // Navigation events
    document.querySelectorAll('[data-navigate]').forEach(element => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            const targetView = element.dataset.navigate;
            navigateToView(targetView);
        });
    });
    
    // Button to create new story
    document.getElementById('new-story-btn')?.addEventListener('click', () => {
        navigateToView('create');
    });
    
    // Form to start a new story
    document.getElementById('create-story-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const promptInput = document.getElementById('story-prompt');
        const genreSelect = document.getElementById('story-genre');
        
        if (promptInput && window.createStory) {
            const prompt = promptInput.value.trim();
            const genre = genreSelect?.value || 'fantasy';
            
            if (prompt) {
                try {
                    const storyControlsElem = document.getElementById('story-controls');
                    if (storyControlsElem) {
                        storyControlsElem.classList.remove('hidden');
                    }
                    
                    await window.createStory(prompt, { genre });
                    
                    // Clear the prompt input
                    promptInput.value = '';
                    
                    // Navigate to the story view
                    navigateToView('story');
                } catch (error) {
                    showError('Failed to create story', error);
                }
            }
        }
    });
    
    // Form to continue a story
    document.getElementById('continue-story-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userInputElem = document.getElementById('user-input');
        
        if (userInputElem && window.continueStory) {
            const userInput = userInputElem.value.trim();
            
            if (userInput) {
                try {
                    await window.continueStory(userInput);
                    
                    // Clear the input
                    userInputElem.value = '';
                } catch (error) {
                    showError('Failed to continue story', error);
                }
            }
        }
    });
    
    // Save story button
    document.getElementById('save-story-btn')?.addEventListener('click', async () => {
        if (window.saveStory) {
            try {
                await window.saveStory();
                showNotification('Story saved successfully');
            } catch (error) {
                showError('Failed to save story', error);
            }
        }
    });
    
    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        logout();
    });
    
    // Theme toggle buttons
    document.querySelectorAll('[data-theme]').forEach(button => {
        button.addEventListener('click', () => {
            if (window.changeTheme) {
                const theme = button.dataset.theme;
                window.changeTheme(theme);
            }
        });
    });
}

/**
 * Navigate to a specific view
 * 
 * @param {string} viewName - Name of the view to navigate to
 */
function navigateToView(viewName) {
    // Validate view exists
    if (!appState.availableViews.includes(viewName) && viewName !== 'story') {
        console.error(`View "${viewName}" does not exist`);
        return;
    }
    
    // Hide all views
    document.querySelectorAll('.app-view').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show requested view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.remove('hidden');
    } else {
        console.error(`View element #${viewName}-view not found in DOM`);
        return;
    }
    
    // Update active navigation
    document.querySelectorAll('[data-navigate]').forEach(navItem => {
        navItem.classList.toggle('active', navItem.dataset.navigate === viewName);
    });
    
    // Update current view in state
    appState.currentView = viewName;
    
    // Dispatch view change event
    window.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { view: viewName }
    }));
    
    console.log(`Navigated to view: ${viewName}`);
}

/**
 * Load user session data
 * 
 * @returns {Promise<Object|null>} - User object or null if not authenticated
 */
async function loadUserSession() {
    try {
        // Request user session data from server
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'get_session'
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data.user) {
            // Set user in state
            appState.currentUser = data.data.user;
            
            // Update UI with user info
            updateUserUI(data.data.user);
            
            return data.data.user;
        } else {
            // No valid session found, redirect to login
            redirectToLogin();
            return null;
        }
    } catch (error) {
        console.error('Error loading user session:', error);
        redirectToLogin();
        return null;
    }
}

/**
 * Update UI elements with user information
 * 
 * @param {Object} user - User object
 */
function updateUserUI(user) {
    // Update username displays
    document.querySelectorAll('.user-name').forEach(element => {
        element.textContent = user.name || user.username;
    });
    
    // Update user avatar if available
    document.querySelectorAll('.user-avatar').forEach(element => {
        if (user.avatar) {
            element.src = user.avatar;
        } else {
            element.src = '/images/default-avatar.png';  // Default avatar
        }
        element.alt = `${user.name || user.username}'s avatar`;
    });
}

/**
 * Show a notification to the user
 * 
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, success, warning, error)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to DOM
    const notificationsContainer = document.getElementById('notifications');
    if (notificationsContainer) {
        notificationsContainer.appendChild(notification);
    } else {
        // Create container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'notifications';
        container.className = 'notifications-container';
        container.appendChild(notification);
        document.body.appendChild(container);
    }
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after a delay for non-error notifications
    if (type !== 'error') {
        setTimeout(() => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
}

/**
 * Show an error notification
 * 
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
function showError(message, error) {
    console.error(message, error);
    showNotification(`${message}: ${error.message}`, 'error');
}

/**
 * Redirect to the login page
 */
function redirectToLogin() {
    window.location.href = '/client/login/login.html';
}

/**
 * Log the user out
 */
async function logout() {
    try {
        // Send logout request to server
        await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'logout'
            })
        });
        
        // Redirect to login page
        redirectToLogin();
    } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect even if there was an error
        redirectToLogin();
    }
}

/**
 * Load user stories from the server
 * 
 * @returns {Promise<Array>} - Array of story objects
 */
async function loadUserStories() {
    try {
        // Request user stories data from server
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'get_user_stories'
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            return data.data.stories || [];
        } else {
            console.error('Failed to load stories:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error loading user stories:', error);
        return [];
    }
}

/**
 * Update the stories list in the UI
 * 
 * @param {Array} stories - Array of story objects
 */
function updateStoriesList(stories) {
    const storiesListElement = document.getElementById('stories-list');
    if (!storiesListElement) return;
    
    if (!stories || stories.length === 0) {
        storiesListElement.innerHTML = '<p class="no-stories">You don\'t have any stories yet.</p>';
        return;
    }
    
    // Clear existing list
    storiesListElement.innerHTML = '';
    
    // Add each story to the list
    stories.forEach(story => {
        const storyElement = document.createElement('div');
        storyElement.className = 'story-item';
        storyElement.dataset.storyId = story.id;
        
        storyElement.innerHTML = `
            <h3 class="story-item-title">${story.title || 'Untitled Story'}</h3>
            <p class="story-item-meta">
                <span class="story-genre">${story.genre || 'General'}</span>
                <span class="story-date">${formatDate(story.last_modified || story.created_at)}</span>
            </p>
            <p class="story-item-preview">${getStoryPreview(story.content)}</p>
            <div class="story-item-actions">
                <button class="btn btn-primary" data-action="open" data-story-id="${story.id}">Open</button>
                <button class="btn btn-text" data-action="delete" data-story-id="${story.id}">Delete</button>
            </div>
        `;
        
        storiesListElement.appendChild(storyElement);
        
        // Add event listener to open button
        storyElement.querySelector('[data-action="open"]').addEventListener('click', () => {
            if (window.loadStory) {
                loadStory(story.id).then(() => {
                    navigateToView('story');
                }).catch(error => {
                    showError('Failed to open story', error);
                });
            }
        });
        
        // Add event listener to delete button
        storyElement.querySelector('[data-action="delete"]').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete "${story.title || 'Untitled Story'}"?`)) {
                deleteStory(story.id).then(() => {
                    // Refresh stories list
                    loadUserStories().then(stories => {
                        updateStoriesList(stories);
                    });
                }).catch(error => {
                    showError('Failed to delete story', error);
                });
            }
        });
    });
}

/**
 * Get a preview of the story content
 * 
 * @param {string} content - Full story content
 * @returns {string} - Preview text
 */
function getStoryPreview(content) {
    if (!content) return 'No content';
    
    // Get first 100 characters
    const preview = content.slice(0, 100).trim();
    
    return preview.length >= 100 ? `${preview}...` : preview;
}

/**
 * Format a date for display
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    } catch (e) {
        return 'Unknown date';
    }
}

/**
 * Delete a story
 * 
 * @param {string} storyId - ID of the story to delete
 * @returns {Promise<boolean>} - Success status
 */
async function deleteStory(storyId) {
    try {
        // Send delete request
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'delete_story',
                data: {
                    story_id: storyId
                }
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            showNotification('Story deleted successfully', 'success');
            return true;
        } else {
            throw new Error(data.message || 'Failed to delete story');
        }
    } catch (error) {
        console.error('Error deleting story:', error);
        showError('Failed to delete story', error);
        return false;
    }
}

// Initialize app when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    initApp({
        theme: localStorage.getItem('gamegen2-theme') || 'default',
        initialView: 'dashboard'
    });
    
    // Load user stories for the stories view
    document.getElementById('stories-nav-link')?.addEventListener('click', () => {
        loadUserStories().then(stories => {
            updateStoriesList(stories);
        }).catch(error => {
            showError('Failed to load stories', error);
        });
    });
});

// Expose key functions to global scope
window.appNavigate = navigateToView;
window.appShowNotification = showNotification;
window.appShowError = showError;
window.appLogout = logout;