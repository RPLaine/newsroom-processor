/**
 * Main application script for GameGen2
 */
class AppManager {
    constructor() {
        this.currentView = null;
        this.userData = null;
        
        // Initialize app structure
        this.initializeApp();
        
        // Listen for authentication state changes
        document.addEventListener('auth-change', (event) => {
            this.handleAuthChange(event.detail);
        });
    }
    
    /**
     * Initialize the application structure
     */
    initializeApp() {
        // Create and populate the header
        const header = document.getElementById('app-header');
        if (header) {
            header.innerHTML = `
                <h1>GameGen2</h1>
                <nav>
                    <ul>
                        <li><a href="#" data-view="home">Home</a></li>
                        <li><a href="#" data-view="games">Games</a></li>
                        <li><a href="#" data-view="about">About</a></li>
                    </ul>
                </nav>
                <div id="user-info">
                    <span id="user-email">Loading...</span>
                    <button id="logout-button">Logout</button>
                </div>
            `;
        }
        
        // Create and populate the game container
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.innerHTML = `
                <section id="welcome-section" class="section">
                    <h2>Welcome to GameGen2</h2>
                    <p>This is a platform for generating and playing games.</p>
                    <button id="test-button" class="button-hover">Test JavaScript</button>
                    <p id="result">Click the button to test JavaScript.</p>
                </section>
            `;
        }
        
        // Create and populate the footer
        const footer = document.getElementById('app-footer');
        if (footer) {
            footer.innerHTML = `
                <p>&copy; 2025 GameGen2. All rights reserved.</p>
            `;
        }
        
        // Add event listeners
        this.addEventListeners();
        
        // Check authentication
        if (typeof authManager !== 'undefined') {
            authManager.checkAuthentication().then(isAuthenticated => {
                this.updateUserDisplay(isAuthenticated);
            });
        }
    }
    
    /**
     * Add event listeners for interactive elements
     */
    addEventListeners() {
        // Get the button element
        const testButton = document.getElementById('test-button');
        const logoutButton = document.getElementById('logout-button');
        
        // Add click event listener to the test button
        if (testButton) {
            testButton.addEventListener('click', () => {
                const result = document.getElementById('result');
                if (result) {
                    // Change the result text
                    result.textContent = 'JavaScript is working correctly!';
                    
                    // Add a simple animation effect
                    result.style.color = 'var(--accent-color)';
                    setTimeout(() => {
                        result.style.color = 'var(--text-color)';
                    }, 1500);
                }
            });
        }
        
        // Add logout functionality
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                if (typeof authManager !== 'undefined') {
                    authManager.logout();
                }
            });
        }
        
        // Add view navigation
        const navLinks = document.querySelectorAll('nav a[data-view]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.getAttribute('data-view');
                this.switchView(view);
            });
        });
    }
    
    /**
     * Handle authentication state changes
     * @param {Object} authDetail - Authentication details
     */
    handleAuthChange(authDetail) {
        this.updateUserDisplay(authDetail.authenticated, authDetail.user_id);
        
        // Load user data if authenticated
        if (authDetail.authenticated) {
            this.loadUserData();
            this.switchView('home');
        }
    }
    
    /**
     * Update user display based on authentication state
     * @param {boolean} isAuthenticated - Whether user is authenticated
     * @param {string} userId - User ID (email)
     */
    updateUserDisplay(isAuthenticated, userId = null) {
        const userEmail = document.getElementById('user-email');
        const userInfo = document.getElementById('user-info');
        
        if (isAuthenticated && userId) {
            if (userEmail) userEmail.textContent = userId;
            if (userInfo) userInfo.style.display = 'flex';
        } else {
            if (userEmail) userEmail.textContent = 'Not logged in';
            if (userInfo) userInfo.style.display = 'none';
        }
    }
    
    /**
     * Load user data from server
     */
    loadUserData() {
        // We'll use the API to get user data
        fetch('/api/user-data')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load user data');
                }
                return response.json();
            })
            .then(data => {
                this.userData = data;
                this.updateGameInterface();
            })
            .catch(error => {
                console.error('Error loading user data:', error);
            });
    }
    
    /**
     * Update game interface based on user data
     */
    updateGameInterface() {
        // This will be implemented based on the game requirements
        // For now, just display a welcome message with the current time
        
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;
        
        // Display the current date and time
        const now = new Date();
        const dateTimeString = now.toLocaleString();
        
        // Append the current time to the container if not already present
        const timeElement = document.getElementById('time-element');
        if (!timeElement) {
            const newTimeElement = document.createElement('p');
            newTimeElement.id = 'time-element';
            newTimeElement.textContent = `Page loaded at: ${dateTimeString}`;
            gameContainer.appendChild(newTimeElement);
        }
    }
    
    /**
     * Switch to a different view
     * @param {string} viewName - Name of the view to show
     */
    switchView(viewName) {
        this.currentView = viewName;
        
        // In a full implementation, this would load different views/components
        console.log(`Switched to ${viewName} view`);
        
        // For now, just update active state in navigation
        const navLinks = document.querySelectorAll('nav a[data-view]');
        navLinks.forEach(link => {
            const linkView = link.getAttribute('data-view');
            if (linkView === viewName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Initialize app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Create app manager instance
    const app = new AppManager();
    
    // Make globally accessible for debugging
    window.app = app;
});