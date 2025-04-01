/**
 * GameGen2 Storytelling Module
 * 
 * This module handles story generation, user input processing, and storytelling UI interactions.
 * It provides the core functionality for creating and continuing stories.
 */

// Story state management
const storyState = {
    currentStory: null,
    storyHistory: [],
    isGenerating: false,
    currentParams: {
        genre: 'fantasy',
        style: 'descriptive',
        temperature: 0.7
    }
};

/**
 * Initialize the storytelling module
 * 
 * @param {Object} options - Configuration options
 * @returns {Promise<void>}
 */
async function initStorytelling(options = {}) {
    console.log('Initializing storytelling module...');
    
    // Set initial parameters from options
    if (options.genre) storyState.currentParams.genre = options.genre;
    if (options.style) storyState.currentParams.style = options.style;
    if (options.temperature) storyState.currentParams.temperature = options.temperature;
    
    // Register event listeners for storytelling components
    registerEventListeners();
    
    console.log('Storytelling module initialized');
}

/**
 * Register event listeners for storytelling UI components
 */
function registerEventListeners() {
    // Listen for theme changes to adjust storytelling UI accordingly
    window.addEventListener('themeChanged', (event) => {
        const theme = event.detail.theme;
        console.log('Theme changed in storytelling module:', theme);
        
        // Apply theme-specific styles to story elements
        applyThemeToStory(theme);
    });
    
    // Save story button
    document.getElementById('save-story-btn')?.addEventListener('click', async () => {
        if (storyState.currentStory) {
            try {
                await saveStory();
                showNotification('Story saved successfully!', 'success');
            } catch (error) {
                showError('Failed to save story', error);
            }
        }
    });
}

/**
 * Apply theme-specific styles to story elements
 * 
 * @param {string} themeName - Name of the theme to apply
 */
function applyThemeToStory(themeName) {
    const storyContent = document.getElementById('story-content');
    if (!storyContent) return;
    
    // Remove any existing theme classes
    storyContent.classList.remove('theme-default', 'theme-dark', 'theme-light');
    
    // Add the new theme class
    storyContent.classList.add(`theme-${themeName}`);
}

/**
 * Create a new story with the given prompt
 * 
 * @param {string} prompt - The initial story prompt
 * @param {Object} options - Additional options (genre, style, etc.)
 * @returns {Promise<Object>} - Created story object
 */
async function createStory(prompt, options = {}) {
    if (!prompt) {
        throw new Error('Story prompt is required');
    }
    
    try {
        // Show loading indicator
        addLoadingIndicator();
        storyState.isGenerating = true;
        
        // Merge options with current parameters
        const params = {
            ...storyState.currentParams,
            ...options
        };
        
        // Send request to create story
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'create_story',
                prompt: prompt,
                genre: params.genre
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data.story) {
            // Set current story
            storyState.currentStory = data.data.story;
            
            // Add to history
            storyState.storyHistory.push({
                type: 'create',
                prompt: prompt,
                result: data.data.story.content
            });
            
            // Update UI with story content
            updateStoryUI(data.data.story);
            
            // Return the created story
            return data.data.story;
        } else {
            throw new Error(data.message || 'Failed to create story');
        }
    } catch (error) {
        console.error('Error creating story:', error);
        throw error;
    } finally {
        // Remove loading indicator
        removeLoadingIndicator();
        storyState.isGenerating = false;
    }
}

/**
 * Continue an existing story with user input
 * 
 * @param {string} userInput - The user's continuation input
 * @returns {Promise<Object>} - Updated story object
 */
async function continueStory(userInput) {
    if (!userInput) {
        throw new Error('User input is required');
    }
    
    if (!storyState.currentStory) {
        throw new Error('No active story to continue');
    }
    
    try {
        // Show loading indicator
        addLoadingIndicator();
        storyState.isGenerating = true;
        
        // Send request to continue story
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'continue_story',
                story_id: storyState.currentStory.id,
                user_input: userInput
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data.story) {
            // Update current story
            storyState.currentStory = data.data.story;
            
            // Add to history
            storyState.storyHistory.push({
                type: 'continue',
                input: userInput,
                result: data.data.story.content
            });
            
            // Update UI with story content
            updateStoryUI(data.data.story);
            
            // Return the updated story
            return data.data.story;
        } else {
            throw new Error(data.message || 'Failed to continue story');
        }
    } catch (error) {
        console.error('Error continuing story:', error);
        throw error;
    } finally {
        // Remove loading indicator
        removeLoadingIndicator();
        storyState.isGenerating = false;
    }
}

/**
 * Update the story UI with content
 * 
 * @param {Object} story - Story object with content
 */
function updateStoryUI(story) {
    const storyContentElement = document.getElementById('story-content');
    if (storyContentElement) {
        storyContentElement.innerHTML = formatStoryText(story.content);
        storyContentElement.scrollTop = 0; // Scroll to the top
    }
}

/**
 * Add loading indicator to the story UI
 */
function addLoadingIndicator() {
    const storyContent = document.getElementById('story-content');
    if (!storyContent) return;
    
    // Add loading class
    storyContent.classList.add('loading');
    
    // Create loading indicator if it doesn't exist
    if (!document.getElementById('story-loading')) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'story-loading';
        loadingIndicator.className = 'story-loading';
        loadingIndicator.innerHTML = `
            <div class="spinner"></div>
            <p>Generating story...</p>
        `;
        storyContent.appendChild(loadingIndicator);
    }
}

/**
 * Remove loading indicator from the story UI
 */
function removeLoadingIndicator() {
    const storyContent = document.getElementById('story-content');
    if (!storyContent) return;
    
    // Remove loading class
    storyContent.classList.remove('loading');
    
    // Remove loading indicator if it exists
    const loadingIndicator = document.getElementById('story-loading');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

/**
 * Format raw story text for display
 * 
 * @param {string} text - Raw story text
 * @returns {string} - Formatted HTML
 */
function formatStoryText(text) {
    if (!text) return '';
    
    // Convert line breaks to paragraphs
    return text.split('\n\n')
        .filter(paragraph => paragraph.trim() !== '')
        .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
        .join('');
}

/**
 * Save the current story
 * 
 * @param {Object} metadata - Additional metadata for the story
 * @returns {Promise<Object>} - Saved story object
 */
async function saveStory(metadata = {}) {
    if (!storyState.currentStory) {
        throw new Error('No active story to save');
    }
    
    try {
        // For now, our backend automatically saves stories when they're created/continued
        // This function would be used for explicit save actions or metadata updates
        
        // Return the current story
        return storyState.currentStory;
    } catch (error) {
        console.error('Error saving story:', error);
        throw error;
    }
}

/**
 * Load a story by ID
 * 
 * @param {string} storyId - ID of the story to load
 * @returns {Promise<Object>} - Loaded story object
 */
async function loadStory(storyId) {
    if (!storyId) {
        throw new Error('Story ID is required');
    }
    
    try {
        // For now, we'll fetch all stories and find the one we want
        // In a future enhancement, we could add a specific endpoint
        
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'get_stories'
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data.stories) {
            // Find the story by ID
            const story = data.data.stories.find(s => s.id === storyId);
            
            if (!story) {
                throw new Error('Story not found');
            }
            
            // Set as current story
            storyState.currentStory = story;
            
            // Update UI with story content
            updateStoryUI(story);
            
            // Return the story
            return story;
        } else {
            throw new Error(data.message || 'Failed to load stories');
        }
    } catch (error) {
        console.error('Error loading story:', error);
        throw error;
    }
}

/**
 * Set story generation parameters
 * 
 * @param {Object} params - Parameters to set
 */
function setStoryParams(params = {}) {
    // Update parameters
    storyState.currentParams = {
        ...storyState.currentParams,
        ...params
    };
    
    console.log('Story parameters updated:', storyState.currentParams);
}

/**
 * Get current story generation parameters
 * 
 * @returns {Object} - Current parameters
 */
function getStoryParams() {
    return { ...storyState.currentParams };
}

/**
 * Get the current story
 * 
 * @returns {Object|null} - Current story or null if none
 */
function getCurrentStory() {
    return storyState.currentStory;
}

/**
 * Check if a story is currently being generated
 * 
 * @returns {boolean} - True if generating, false otherwise
 */
function isGeneratingStory() {
    return storyState.isGenerating;
}

/**
 * Reset the current story state
 */
function resetStory() {
    storyState.currentStory = null;
    storyState.storyHistory = [];
    storyState.isGenerating = false;
}

/**
 * Get story generation history
 * 
 * @returns {Array} - History entries
 */
function getStoryHistory() {
    return [...storyState.storyHistory];
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
    if (window.showNotification) {
        window.showNotification(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Helper function to show errors
function showError(message, error) {
    if (window.showError) {
        window.showError(message, error);
    } else {
        console.error(message, error);
    }
}

// Expose functions to global scope
window.initStorytelling = initStorytelling;
window.createStory = createStory;
window.continueStory = continueStory;
window.saveStory = saveStory;
window.loadStory = loadStory;
window.setStoryParams = setStoryParams;
window.getStoryParams = getStoryParams;
window.getCurrentStory = getCurrentStory;
window.isGeneratingStory = isGeneratingStory;
window.resetStory = resetStory;
window.getStoryHistory = getStoryHistory;