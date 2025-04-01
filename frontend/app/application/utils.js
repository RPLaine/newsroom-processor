import appState from './state.js';

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    const notificationsContainer = document.getElementById('notifications');
    if (notificationsContainer) {
        notificationsContainer.appendChild(notification);
    } else {
        const container = document.createElement('div');
        container.id = 'notifications';
        container.className = 'notifications-container';
        container.appendChild(notification);
        document.body.appendChild(container);
    }
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    if (type !== 'error') {
        setTimeout(() => {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
}

function showError(message, error) {
    console.error(message, error);
    showNotification(`${message}: ${error.message || 'Unknown error'}`, 'error');
}

/**
 * Navigate to a specific view in the application
 * 
 * @param {string} viewName - The name of the view to navigate to
 * @param {Object} params - Optional parameters for the view
 */
function navigateToView(viewName, params = {}) {
    // Validate view name
    if (!appState.availableViews.includes(viewName)) {
        console.error(`Invalid view name: ${viewName}`);
        return;
    }
    
    // Hide all views
    document.querySelectorAll('.app-view').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show the requested view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.remove('hidden');
    } else {
        console.error(`View element not found: ${viewName}-view`);
        return;
    }
    
    // Update navigation links
    document.querySelectorAll('[data-navigate]').forEach(link => {
        if (link.dataset.navigate === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update application state
    appState.currentView = viewName;
    
    // Handle special view logic
    if (viewName === 'story' && params.storyId) {
        loadStory(params.storyId);
    } else if (viewName === 'stories') {
        loadStories();
    }
}

/**
 * Load story data
 * 
 * @param {string} storyId - ID of the story to load
 */
function loadStory(storyId) {
    // This would be implemented to fetch and display story data
    console.log(`Loading story: ${storyId}`);
    document.getElementById('story-content').innerHTML = '<p>Loading story...</p>';
    document.getElementById('story-controls').classList.remove('hidden');
}

/**
 * Load stories list
 */
function loadStories() {
    console.log('Loading stories list');
    // Story list loading would be triggered via an event in eventHandlers.js
}

/**
 * Initialize styling based on user preferences
 */
function initStyling() {
    const savedTheme = localStorage.getItem('gamegen2-theme') || 'default';
    document.body.dataset.theme = savedTheme;
}

export { showNotification, showError, navigateToView, initStyling };