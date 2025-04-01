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
    availableViews: ['dashboard', 'create', 'stories', 'settings', 'story'],
    sessionStartTime: null
};

/**
 * Create and initialize the application
 * 
 * @param {Object} data - Initial data from server
 * @param {HTMLElement} appContainer - The app container element
 * @param {Function} fetchData - The data fetching function
 * @returns {Promise<Object>} Updated data after initialization
 */
async function createApp(data, appContainer, fetchData) {
    console.log('Creating app...');
    
    // Store the user data
    appState.currentUser = data;
    
    // Create app structure
    appContainer.innerHTML = `
        <header class="app-header">
            <h1>GameGen2</h1>
            <div class="user-info">
                <span class="user-name">${data.userdata?.profile?.username || 'User'}</span>
                <button id="logout-btn" class="btn btn-small btn-primary">Logout</button>
            </div>
        </header>
        <nav class="app-nav">
            <ul>
                <li><a href="#" class="active" data-navigate="dashboard">Dashboard</a></li>
                <li><a href="#" data-navigate="create">Create Story</a></li>
                <li><a href="#" id="stories-nav-link" data-navigate="stories">My Stories</a></li>
                <li><a href="#" data-navigate="settings">Settings</a></li>
            </ul>
        </nav>
        <main>
            <div id="dashboard-view" class="app-view">
                <h2>Welcome to GameGen2</h2>
                <p>Start creating your narrative adventure today!</p>
                <button id="new-story-btn" class="btn btn-primary">Create New Story</button>
            </div>
            <div id="create-view" class="app-view hidden">
                <h2>Create New Story</h2>
                <form id="create-story-form">
                    <div class="form-group">
                        <label for="story-prompt">Enter a prompt to start your story:</label>
                        <textarea id="story-prompt" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="story-genre">Genre:</label>
                        <select id="story-genre">
                            <option value="fantasy">Fantasy</option>
                            <option value="sci-fi">Science Fiction</option>
                            <option value="mystery">Mystery</option>
                            <option value="horror">Horror</option>
                            <option value="adventure">Adventure</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Start Story</button>
                </form>
            </div>
            <div id="stories-view" class="app-view hidden">
                <h2>My Stories</h2>
                <div id="stories-list" class="stories-list">
                    <p>Loading stories...</p>
                </div>
            </div>
            <div id="settings-view" class="app-view hidden">
                <h2>Settings</h2>
                <div class="settings-section">
                    <h3>Theme</h3>
                    <div class="theme-options">
                        <button class="theme-btn" data-theme="default">Default</button>
                        <button class="theme-btn" data-theme="dark">Dark</button>
                        <button class="theme-btn" data-theme="light">Light</button>
                    </div>
                </div>
            </div>
            <div id="story-view" class="app-view hidden">
                <div id="story-content"></div>
                <div id="story-controls" class="hidden">
                    <form id="continue-story-form">
                        <div class="form-group">
                            <label for="user-input">What happens next?</label>
                            <textarea id="user-input" rows="3" required></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Continue</button>
                            <button type="button" id="save-story-btn" class="btn">Save Story</button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
        <div id="notifications" class="notifications-container"></div>
    `;
    
    // Initialize the app
    await initApp({
        theme: localStorage.getItem('gamegen2-theme') || 'default',
        initialView: 'dashboard',
        fetchData: fetchData
    });
    
    // Initialize event handlers that need direct access to fetchData
    initializeEventHandlersWithApi(fetchData);
    
    return data;
}

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
        initStyling({
            defaultTheme: options.theme || 'default'
        });
        
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
    
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            if (theme) {
                setTheme(theme);
            }
        });
    });
    
    // Logout button
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect to login even if there was an error
            window.location.href = '/';
        }
    });
}

/**
 * Initialize event handlers that need access to the fetch data function
 * 
 * @param {Function} fetchData - The data fetching function
 */
function initializeEventHandlersWithApi(fetchData) {
    // Stories tab click - load stories
    document.getElementById('stories-nav-link')?.addEventListener('click', async () => {
        try {
            const response = await fetchData({
                action: 'get_stories'
            });
            
            if (response.status === 'success' && response.data?.stories) {
                updateStoriesList(response.data.stories);
            } else {
                throw new Error(response.message || 'Failed to load stories');
            }
        } catch (error) {
            showError('Failed to load stories', error);
        }
    });
}

/**
 * Initialize styling module
 * 
 * @param {Object} options - Styling options
 */
function initStyling(options = {}) {
    // Set theme
    setTheme(options.defaultTheme || 'default');
}

/**
 * Set application theme
 * 
 * @param {string} themeName - Name of the theme to set
 */
function setTheme(themeName) {
    // Set theme class on body
    document.body.classList.remove('theme-default', 'theme-dark', 'theme-light');
    document.body.classList.add(`theme-${themeName}`);
    
    // Store theme preference
    localStorage.setItem('gamegen2-theme', themeName);
    
    // Dispatch theme changed event
    window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { theme: themeName }
    }));
    
    console.log(`Theme set to: ${themeName}`);
}

/**
 * Navigate to a specific view
 * 
 * @param {string} viewName - Name of the view to navigate to
 */
function navigateToView(viewName) {
    // Validate view exists
    if (!appState.availableViews.includes(viewName)) {
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
        // User data should already be available in appState from createApp
        if (appState.currentUser) {
            // Update UI with user info
            updateUserUI(appState.currentUser);
            return appState.currentUser;
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
        element.textContent = user.userdata?.profile?.username || user.username || 'User';
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
    showNotification(`${message}: ${error.message || 'Unknown error'}`, 'error');
}

/**
 * Redirect to the login page
 */
function redirectToLogin() {
    window.location.href = '/';
}

/**
 * Log the user out
 */
async function logout() {
    try {
        // Send logout request to server
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'logout'
            })
        });
        
        // Redirect to login page regardless of response
        redirectToLogin();
    } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect even if there was an error
        redirectToLogin();
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
    
    // Clear the current list
    storiesListElement.innerHTML = '';
    
    // If no stories, show a message
    if (!stories || stories.length === 0) {
        storiesListElement.innerHTML = '<p>You haven\'t created any stories yet.</p>';
        return;
    }
    
    // Create a story item for each story
    stories.forEach(story => {
        const storyElement = document.createElement('div');
        storyElement.className = 'story-item';
        storyElement.innerHTML = `
            <div class="story-item-header">
                <div>
                    <h3 class="story-title">${story.title || 'Untitled Story'}</h3>
                    <span class="story-genre">${story.genre || 'Unknown'}</span>
                </div>
                <span class="story-date">${formatDate(story.last_modified || story.created_at)}</span>
            </div>
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
                window.loadStory(story.id).then(() => {
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
                    showNotification('Story deleted successfully', 'success');
                    // Refresh stories list
                    window.fetchData({
                        action: 'get_stories'
                    }).then(response => {
                        if (response.status === 'success') {
                            updateStoriesList(response.data.stories);
                        }
                    }).catch(error => {
                        showError('Failed to refresh stories', error);
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
 * @param {string|number} timestamp - ISO date string or Unix timestamp
 * @returns {string} - Formatted date
 */
function formatDate(timestamp) {
    try {
        const date = typeof timestamp === 'number' 
            ? new Date(timestamp * 1000) // Convert Unix timestamp to milliseconds
            : new Date(timestamp);
            
        return date.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (e) {
        return 'Unknown date';
    }
}

/**
 * Delete a story by ID
 * 
 * @param {string} storyId - ID of the story to delete
 * @returns {Promise<boolean>} - Success status
 */
async function deleteStory(storyId) {
    if (!storyId) {
        throw new Error('Story ID is required');
    }
    
    try {
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'delete_story',
                story_id: storyId
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            return true;
        } else {
            throw new Error(data.message || 'Failed to delete story');
        }
    } catch (error) {
        console.error('Error deleting story:', error);
        throw error;
    }
}

// Expose functions to global scope
window.showNotification = showNotification;
window.showError = showError;
window.navigateToView = navigateToView;

// Export the module
export default {
    createApp,
    initApp,
    navigateToView,
    showNotification,
    showError
};