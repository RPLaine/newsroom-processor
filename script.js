/**
 * Main application script for GameGen2's immersive storytelling experience
 */
class StorytellingEngine {
    constructor() {
        this.userData = null;
        this.currentStoryState = null;
        this.storyHistory = [];
        
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
        // Build the basic app structure
        this.buildAppStructure();
        
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
     * Build the basic application structure
     * This method creates all the necessary DOM elements
     */
    buildAppStructure() {
        const appMain = document.getElementById('app-main');
        
        // Get references to containers
        const loginContainer = document.getElementById('login-container');
        const gameContainer = document.getElementById('game-container');
        
        // Add user info to app-main instead of a separate header
        const userInfo = document.createElement('div');
        userInfo.id = 'user-info';
        userInfo.innerHTML = `
            <span id="user-email">Loading...</span>
            <button id="logout-button">Exit Story</button>
        `;
        appMain.appendChild(userInfo);
        
        // Build login container content
        if (loginContainer) {
            loginContainer.innerHTML = `
                <div class="storytelling-container">
                    <!-- Floating quote bubbles that represent story ideas -->
                    <div class="quote-bubble">
                        "I emerged from the portal to find a world where technology and magic coexisted..."
                    </div>
                    <div class="quote-bubble">
                        "The spaceship's AI whispered a secret that would change everything..."
                    </div>
                    <div class="quote-bubble">
                        "With ancient powers awakening, I discovered my true destiny..."
                    </div>
                    <div class="quote-bubble">
                        "The mystery deepened as I uncovered hidden symbols in the forgotten temple..."
                    </div>
                    
                    <div class="storytelling-text">
                        <h1>Infinite Storytelling Awaits</h1>
                        <p>Enter a realm where imagination has no boundaries. Create and experience stories that adapt to your desires, limited only by your imagination. Every choice shapes your unique adventure.</p>
                    </div>
                    
                    <section class="auth-container">
                        <div class="auth-form-container">
                            <div class="auth-tabs">
                                <button id="login-tab" class="auth-tab active">Login</button>
                                <button id="register-tab" class="auth-tab">Register</button>
                            </div>
                            
                            <form id="login-form" class="auth-form active">
                                <h2>Unlock Your Stories</h2>
                                <div class="form-group">
                                    <label for="login-email">Email</label>
                                    <input type="email" id="login-email" name="email" required autocomplete="username">
                                </div>
                                <div class="form-group">
                                    <label for="login-password">Password</label>
                                    <input type="password" id="login-password" name="password" required autocomplete="current-password">
                                </div>
                                <div id="login-message" class="auth-message"></div>
                                <button type="submit" class="auth-button">Begin Journey</button>
                            </form>

                            <form id="register-form" class="auth-form">
                                <h2>Create Your Universe</h2>
                                <div class="form-group">
                                    <label for="register-email">Email</label>
                                    <input type="email" id="register-email" name="email" required autocomplete="username">
                                </div>
                                <div class="form-group">
                                    <label for="register-password">Password</label>
                                    <input type="password" id="register-password" name="password" required minlength="8" autocomplete="new-password">
                                </div>
                                <div class="form-group">
                                    <label for="register-confirm-password">Confirm Password</label>
                                    <input type="password" id="register-confirm-password" name="confirm-password" required minlength="8" autocomplete="new-password">
                                </div>
                                <div id="register-message" class="auth-message"></div>
                                <button type="submit" class="auth-button">Start Creating</button>
                            </form>
                        </div>
                    </section>
                </div>
            `;
        }
        
        // Build game container content
        if (gameContainer) {
            gameContainer.innerHTML = `
                <div class="storytelling-interface">
                    <div id="story-display" class="story-display">
                        <div class="story-welcome fade-in">
                            <h2>Your Story Begins...</h2>
                            <p>Welcome to a world where your imagination becomes reality. What kind of story would you like to experience today?</p>
                            <div class="story-prompt-container">
                                <div class="story-prompt button-hover" data-genre="fantasy">
                                    <h3>Fantasy</h3>
                                    <p>Explore magical realms, encounter mythical creatures, and discover ancient powers.</p>
                                </div>
                                <div class="story-prompt button-hover" data-genre="scifi">
                                    <h3>Science Fiction</h3>
                                    <p>Travel through space, encounter advanced technology, and explore the unknown.</p>
                                </div>
                                <div class="story-prompt button-hover" data-genre="mystery">
                                    <h3>Mystery</h3>
                                    <p>Unravel secrets, solve puzzles, and discover the truth behind strange events.</p>
                                </div>
                                <div class="story-prompt button-hover" data-genre="adventure">
                                    <h3>Adventure</h3>
                                    <p>Embark on epic journeys, face challenges, and discover hidden treasures.</p>
                                </div>
                            </div>
                            <div class="custom-story-container">
                                <h3>Or describe your own story:</h3>
                                <textarea id="custom-story-input" placeholder="Enter your story idea here..."></textarea>
                                <button id="start-custom-story" class="auth-button button-hover">Begin This Story</button>
                            </div>
                        </div>
                    </div>
                    <div id="story-controls" class="story-controls hidden">
                        <textarea id="user-input" placeholder="What would you like to do?"></textarea>
                        <button id="submit-action" class="auth-button button-hover">Continue Story</button>
                        <div class="story-options">
                            <button id="reset-story" class="secondary-button">New Story</button>
                            <button id="undo-action" class="secondary-button">Undo</button>
                        </div>
                    </div>
                </div>
                <div class="loading-container hidden">
                    <div class="loading-spinner"></div>
                    <p>Crafting your story...</p>
                </div>
            `;
        }
    }
    
    /**
     * Add event listeners for interactive elements
     */
    addEventListeners() {
        const logoutButton = document.getElementById('logout-button');
        
        // Add logout functionality
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                if (typeof authManager !== 'undefined') {
                    authManager.logout();
                }
            });
        }
        
        // Add story prompt listeners
        const storyPrompts = document.querySelectorAll('.story-prompt');
        storyPrompts.forEach(prompt => {
            prompt.addEventListener('click', () => {
                const genre = prompt.getAttribute('data-genre');
                this.startGenreStory(genre);
            });
        });
        
        // Add custom story listener
        const customStoryButton = document.getElementById('start-custom-story');
        if (customStoryButton) {
            customStoryButton.addEventListener('click', () => {
                const customInput = document.getElementById('custom-story-input');
                if (customInput && customInput.value.trim()) {
                    this.startCustomStory(customInput.value);
                }
            });
        }
        
        // Add story control listeners
        const submitAction = document.getElementById('submit-action');
        if (submitAction) {
            submitAction.addEventListener('click', () => {
                this.submitUserAction();
            });
        }
        
        // Add keypress event for user input
        const userInput = document.getElementById('user-input');
        if (userInput) {
            userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.submitUserAction();
                }
            });
        }
        
        // Add reset story button
        const resetStory = document.getElementById('reset-story');
        if (resetStory) {
            resetStory.addEventListener('click', () => {
                this.resetStory();
            });
        }
        
        // Add undo action button
        const undoAction = document.getElementById('undo-action');
        if (undoAction) {
            undoAction.addEventListener('click', () => {
                this.undoAction();
            });
        }
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
                
                // Show game container if it was hidden
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.classList.remove('hidden');
                }
            })
            .catch(error => {
                console.error('Error loading user data:', error);
            });
    }
    
    /**
     * Start a story based on a selected genre
     * @param {string} genre - Genre of story to start
     */
    startGenreStory(genre) {
        const genrePrompts = {
            fantasy: "You find yourself in a mystical forest where the trees whisper secrets of ancient magic. A glowing path leads deeper into the woods...",
            scifi: "The spaceship's emergency sirens blare as you wake from cryosleep. Through the viewport, you see an uncharted planet with three moons...",
            mystery: "The old mansion creaks as you enter, the invitation in your hand. The letter mentioned an inheritance, but the sender's name is unfamiliar...",
            adventure: "The map in your hands points to a treasure hidden in these mountains. As you reach the peak, you notice a hidden cave entrance..."
        };
        
        const prompt = genrePrompts[genre] || "You begin your journey into a new adventure...";
        this.startStory(prompt);
    }
    
    /**
     * Start a story based on custom user input
     * @param {string} customInput - User's custom story start
     */
    startCustomStory(customInput) {
        this.startStory(customInput);
    }
    
    /**
     * Start a new story with the provided prompt
     * @param {string} storyPrompt - Initial story prompt
     */
    startStory(storyPrompt) {
        // Show loading indicator
        this.setLoading(true);
        
        // Show story controls
        const storyControls = document.getElementById('story-controls');
        if (storyControls) {
            storyControls.classList.remove('hidden');
        }
        
        // Initialize story state
        this.currentStoryState = {
            prompt: storyPrompt,
            history: []
        };
        
        // Add initial prompt to history
        this.storyHistory = [{
            type: 'system',
            content: storyPrompt
        }];
        
        // Generate initial story response
        this.generateStoryResponse(storyPrompt)
            .then(response => {
                // Update story display
                this.updateStoryDisplay(response);
                
                // Add to history
                this.storyHistory.push({
                    type: 'response',
                    content: response
                });
                
                // Hide loading indicator
                this.setLoading(false);
            })
            .catch(error => {
                console.error('Error generating story:', error);
                this.updateStoryDisplay("Something went wrong with your story. Let's try again.");
                this.setLoading(false);
            });
    }
    
    /**
     * Submit a user action to continue the story
     */
    submitUserAction() {
        const userInput = document.getElementById('user-input');
        if (!userInput || !userInput.value.trim()) return;
        
        const action = userInput.value.trim();
        
        // Clear input
        userInput.value = '';
        
        // Show loading indicator
        this.setLoading(true);
        
        // Add action to display
        this.appendToStoryDisplay(`<div class="user-action"><strong>You:</strong> ${action}</div>`);
        
        // Add to history
        this.storyHistory.push({
            type: 'user',
            content: action
        });
        
        // Generate response
        this.generateStoryResponse(action)
            .then(response => {
                // Update story display
                this.updateStoryDisplay(response, false);
                
                // Add to history
                this.storyHistory.push({
                    type: 'response',
                    content: response
                });
                
                // Hide loading indicator
                this.setLoading(false);
            })
            .catch(error => {
                console.error('Error generating response:', error);
                this.appendToStoryDisplay('<div class="story-error">Something went wrong with your story. Please try again.</div>');
                this.setLoading(false);
            });
    }
    
    /**
     * Generate a response for the story using the AI
     * @param {string} input - User input or initial prompt
     * @returns {Promise<string>} - Promise that resolves to the story response
     */
    async generateStoryResponse(input) {
        // In a real implementation, this would call the Dolphin 3 LLM API
        // For now, we'll simulate a response based on the input
        
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate simplified response based on the input
        const responses = [
            "The path ahead diverges into shadows and light. Your instinct tells you there's more to this journey than meets the eye.",
            "A mystical figure emerges from the darkness, their eyes gleaming with ancient knowledge. 'I've been expecting you,' they whisper.",
            "The air around you shifts, carrying whispers of forgotten tales. Something significant is about to unfold in your story.",
            "Your decision resonates through the environment, causing subtle changes that might not be immediately apparent.",
            "A sense of accomplishment washes over you as you overcome this challenge, but greater tests lie ahead in your journey."
        ];
        
        // Return a "random" but consistent response based on the input
        const seed = input.length % responses.length;
        return responses[seed] + " What will you do next?";
        
        // In production, this would be:
        /*
        return fetch('https://www.northbeach.fi/dolphin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: this.buildPrompt(input)
            })
        })
        .then(response => response.json())
        .then(data => data.response);
        */
    }
    
    /**
     * Build a prompt for the AI model including history for context
     * @param {string} input - Current user input
     * @returns {string} - Formatted prompt for the AI
     */
    buildPrompt(input) {
        // Build a proper prompt with context from history
        let prompt = "<|im_start|>system\nYou are an immersive storytelling system that creates rich, detailed narratives based on user input. Respond to user actions with vivid descriptions and meaningful plot developments. Be creative and engaging while maintaining consistency with the established story world.<|im_end|>\n";
        
        // Add history context
        this.storyHistory.forEach(item => {
            if (item.type === 'system') {
                prompt += `<|im_start|>system\n${item.content}<|im_end|>\n`;
            } else if (item.type === 'user') {
                prompt += `<|im_start|>user\n${item.content}<|im_end|>\n`;
            } else if (item.type === 'response') {
                prompt += `<|im_start|>assistant\n${item.content}<|im_end|>\n`;
            }
        });
        
        // Add current input
        prompt += `<|im_start|>user\n${input}<|im_end|>\n<|im_start|>assistant\n`;
        
        return prompt;
    }
    
    /**
     * Update the story display with new content
     * @param {string} content - Content to display
     * @param {boolean} replace - Whether to replace existing content
     */
    updateStoryDisplay(content, replace = true) {
        const storyDisplay = document.getElementById('story-display');
        if (!storyDisplay) return;
        
        if (replace) {
            storyDisplay.innerHTML = `<div class="story-content fade-in">${content}</div>`;
        } else {
            this.appendToStoryDisplay(`<div class="story-response">${content}</div>`);
        }
        
        // Scroll to bottom
        storyDisplay.scrollTop = storyDisplay.scrollHeight;
    }
    
    /**
     * Append content to the story display
     * @param {string} content - HTML content to append
     */
    appendToStoryDisplay(content) {
        const storyDisplay = document.getElementById('story-display');
        if (!storyDisplay) return;
        
        // Create a container for the new content
        const container = document.createElement('div');
        container.classList.add('fade-in');
        container.innerHTML = content;
        
        // Append the new container
        storyDisplay.appendChild(container);
        
        // Scroll to bottom
        storyDisplay.scrollTop = storyDisplay.scrollHeight;
    }
    
    /**
     * Set the loading state
     * @param {boolean} isLoading - Whether loading is active
     */
    setLoading(isLoading) {
        const loadingContainer = document.querySelector('.loading-container');
        if (!loadingContainer) return;
        
        if (isLoading) {
            loadingContainer.classList.remove('hidden');
        } else {
            loadingContainer.classList.add('hidden');
        }
    }
    
    /**
     * Reset the story to the beginning
     */
    resetStory() {
        const storyDisplay = document.getElementById('story-display');
        if (storyDisplay) {
            storyDisplay.innerHTML = `
                <div class="story-welcome fade-in">
                    <h2>Your Story Begins...</h2>
                    <p>Welcome to a world where your imagination becomes reality. What kind of story would you like to experience today?</p>
                    <div class="story-prompt-container">
                        <div class="story-prompt button-hover" data-genre="fantasy">
                            <h3>Fantasy</h3>
                            <p>Explore magical realms, encounter mythical creatures, and discover ancient powers.</p>
                        </div>
                        <div class="story-prompt button-hover" data-genre="scifi">
                            <h3>Science Fiction</h3>
                            <p>Travel through space, encounter advanced technology, and explore the unknown.</p>
                        </div>
                        <div class="story-prompt button-hover" data-genre="mystery">
                            <h3>Mystery</h3>
                            <p>Unravel secrets, solve puzzles, and discover the truth behind strange events.</p>
                        </div>
                        <div class="story-prompt button-hover" data-genre="adventure">
                            <h3>Adventure</h3>
                            <p>Embark on epic journeys, face challenges, and discover hidden treasures.</p>
                        </div>
                    </div>
                    <div class="custom-story-container">
                        <h3>Or describe your own story:</h3>
                        <textarea id="custom-story-input" placeholder="Enter your story idea here..."></textarea>
                        <button id="start-custom-story" class="auth-button button-hover">Begin This Story</button>
                    </div>
                </div>
            `;
        }
        
        // Reset history
        this.storyHistory = [];
        
        // Hide controls
        const storyControls = document.getElementById('story-controls');
        if (storyControls) {
            storyControls.classList.add('hidden');
        }
        
        // Re-add event listeners for the new elements
        this.addEventListeners();
    }
    
    /**
     * Undo the last action
     */
    undoAction() {
        // We need at least 2 user entries to undo (initial + at least 1 action)
        if (this.storyHistory.length < 4) {
            return;
        }
        
        // Remove the last two entries (user action and AI response)
        this.storyHistory.pop(); // Remove AI response
        this.storyHistory.pop(); // Remove user action
        
        // Get the last AI response
        const lastResponse = this.storyHistory.find(item => item.type === 'response');
        const content = lastResponse ? lastResponse.content : "Let's continue your story...";
        
        // Update the display
        this.updateStoryDisplay(content);
    }
}

// Initialize app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Create storytelling engine instance
    const storyEngine = new StorytellingEngine();
    
    // Make globally accessible for debugging
    window.storyEngine = storyEngine;
});