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
}

/**
 * Apply theme-specific styles to story elements
 * 
 * @param {string} themeName - Name of the theme to apply
 */
function applyThemeToStory(themeName) {
    const storyElements = document.querySelectorAll('.story-content, .story-text');
    
    // Remove existing theme classes
    storyElements.forEach(element => {
        element.classList.forEach(className => {
            if (className.startsWith('theme-')) {
                element.classList.remove(className);
            }
        });
        
        // Add new theme class
        element.classList.add(`theme-${themeName}`);
    });
}

/**
 * Create a new story with the given prompt
 * 
 * @param {string} prompt - The initial story prompt
 * @param {Object} params - Story generation parameters
 * @returns {Promise<Object>} - Created story object
 */
async function createStory(prompt, params = {}) {
    // Merge with default parameters
    const genParams = {
        ...storyState.currentParams,
        ...params
    };
    
    try {
        storyState.isGenerating = true;
        
        console.log('Creating new story with prompt:', prompt);
        console.log('Generation parameters:', genParams);
        
        // Show loading state in UI if available
        const storyContainer = document.querySelector('.story-content');
        if (storyContainer) {
            storyContainer.innerHTML = '<p class="generating">Generating your story</p>';
        }
        
        // Send request to create story
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'create_story',
                data: {
                    prompt: prompt,
                    genre: genParams.genre,
                    style: genParams.style,
                    temperature: genParams.temperature
                }
            })
        });
        
        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to create story');
        }
        
        // Create story object
        const story = {
            id: result.data.story_id,
            title: result.data.title || 'Untitled Story',
            content: result.data.content || '',
            genre: genParams.genre,
            created_at: new Date().toISOString(),
            last_modified: new Date().toISOString()
        };
        
        // Update story state
        storyState.currentStory = story;
        storyState.storyHistory = [{ 
            content: story.content, 
            timestamp: new Date().toISOString() 
        }];
        
        // Update UI if available
        updateStoryUI(story);
        
        return story;
    } catch (error) {
        console.error('Error creating story:', error);
        
        // Show error in UI if available
        const storyContainer = document.querySelector('.story-content');
        if (storyContainer) {
            storyContainer.innerHTML = `<p class="error">Error creating story: ${error.message}</p>`;
        }
        
        throw error;
    } finally {
        storyState.isGenerating = false;
    }
}

/**
 * Continue an existing story with user input
 * 
 * @param {string} userInput - User input to continue the story
 * @param {Object} params - Story generation parameters
 * @returns {Promise<Object>} - Updated story object
 */
async function continueStory(userInput, params = {}) {
    // Ensure there's a current story
    if (!storyState.currentStory) {
        throw new Error('No active story to continue');
    }
    
    // Merge with default parameters
    const genParams = {
        ...storyState.currentParams,
        ...params
    };
    
    try {
        storyState.isGenerating = true;
        
        console.log('Continuing story with input:', userInput);
        
        // Show loading state in UI if available
        appendToStoryUI('<p class="generating">Generating continuation</p>');
        
        // Send request to continue story
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'continue_story',
                data: {
                    story_id: storyState.currentStory.id,
                    user_input: userInput,
                    temperature: genParams.temperature
                }
            })
        });
        
        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to continue story');
        }
        
        // Remove loading indicator
        removeLoadingIndicator();
        
        // Get continuation text
        const continuationText = result.data.continuation || '';
        
        // Update the current story with new content
        storyState.currentStory.content += '\n\n' + continuationText;
        storyState.currentStory.last_modified = new Date().toISOString();
        
        // Add to history
        storyState.storyHistory.push({
            content: continuationText,
            userInput: userInput,
            timestamp: new Date().toISOString()
        });
        
        // Update UI with only the new content
        appendToStoryUI(continuationText, true);
        
        return storyState.currentStory;
    } catch (error) {
        console.error('Error continuing story:', error);
        
        // Remove loading indicator
        removeLoadingIndicator();
        
        // Show error in UI
        appendToStoryUI(`<p class="error">Error continuing story: ${error.message}</p>`);
        
        throw error;
    } finally {
        storyState.isGenerating = false;
    }
}

/**
 * Update the story UI with a complete story
 * 
 * @param {Object} story - Story object
 */
function updateStoryUI(story) {
    const storyContainer = document.querySelector('.story-content');
    if (!storyContainer) return;
    
    // Set story content
    storyContainer.innerHTML = `<div class="story-text">${formatStoryText(story.content)}</div>`;
    
    // Update title if available
    const titleElement = document.querySelector('.story-title');
    if (titleElement && story.title) {
        titleElement.textContent = story.title;
    }
    
    // Apply current theme
    const currentTheme = window.getCurrentTheme ? window.getCurrentTheme() : 'default';
    applyThemeToStory(currentTheme);
}

/**
 * Append new content to the story UI
 * 
 * @param {string} content - Content to append
 * @param {boolean} animate - Whether to animate the new content
 */
function appendToStoryUI(content, animate = false) {
    const storyContainer = document.querySelector('.story-content');
    if (!storyContainer) return;
    
    // Create new element for the content
    const newContent = document.createElement('div');
    newContent.innerHTML = formatStoryText(content);
    
    // Remove loading indicator if present
    removeLoadingIndicator();
    
    // Import animation utilities if needed
    if (!window.animationUtils) {
        // Create a self-executing function to load the module
        (async () => {
            try {
                const module = await import('../animation/animation.js');
                window.animationUtils = module.default;
            } catch (err) {
                console.error('Could not load animation utilities:', err);
            }
        })();
    }
    
    // Add the content with animation if requested
    if (animate && window.animationUtils) {
        // Use the addElementWithAnimation utility
        window.animationUtils.addElementWithAnimation(newContent, storyContainer, 'new-text');
    } else {
        // Add animation class if requested but utility not available
        if (animate) {
            newContent.classList.add('new-text');
        }
        
        // Append the new content
        storyContainer.appendChild(newContent);
    }
    
    // Scroll to the new content
    newContent.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

/**
 * Remove loading indicator from the story UI
 */
function removeLoadingIndicator() {
    const loadingIndicators = document.querySelectorAll('.generating');
    
    // If animation utilities are available, use them
    if (window.animationUtils) {
        loadingIndicators.forEach(element => {
            window.animationUtils.removeElementWithAnimation(element, 'fade-out');
        });
    } else {
        // Fallback to standard removal
        loadingIndicators.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
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
    
    // Handle paragraphs
    let formatted = text
        .split('\n\n')
        .filter(para => para.trim().length > 0)
        .map(para => `<p>${para.trim()}</p>`)
        .join('');
    
    return formatted;
}

/**
 * Save the current story
 * 
 * @param {Object} metadata - Additional metadata for the story
 * @returns {Promise<Object>} - Saved story object
 */
async function saveStory(metadata = {}) {
    // Ensure there's a current story
    if (!storyState.currentStory) {
        throw new Error('No active story to save');
    }
    
    try {
        console.log('Saving story:', storyState.currentStory.id);
        
        // Prepare save data
        const saveData = {
            story_id: storyState.currentStory.id,
            title: metadata.title || storyState.currentStory.title,
            content: storyState.currentStory.content,
            description: metadata.description || storyState.currentStory.description
        };
        
        // Send save request
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'save_story',
                data: saveData
            })
        });
        
        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to save story');
        }
        
        // Update story metadata
        if (metadata.title) storyState.currentStory.title = metadata.title;
        if (metadata.description) storyState.currentStory.description = metadata.description;
        
        storyState.currentStory.last_modified = new Date().toISOString();
        
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
    try {
        console.log('Loading story:', storyId);
        
        // Send load request
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'load_story',
                data: {
                    story_id: storyId
                }
            })
        });
        
        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to load story');
        }
        
        // Create story object from result
        const story = {
            id: storyId,
            title: result.data.title || 'Untitled Story',
            content: result.data.content || '',
            description: result.data.description,
            genre: result.data.genre || storyState.currentParams.genre,
            created_at: result.data.created_at || new Date().toISOString(),
            last_modified: result.data.last_modified || new Date().toISOString()
        };
        
        // Update story state
        storyState.currentStory = story;
        storyState.storyHistory = [{ 
            content: story.content, 
            timestamp: new Date().toISOString() 
        }];
        
        // Update UI
        updateStoryUI(story);
        
        return story;
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
    if (params.genre !== undefined) storyState.currentParams.genre = params.genre;
    if (params.style !== undefined) storyState.currentParams.style = params.style;
    if (params.temperature !== undefined) storyState.currentParams.temperature = params.temperature;
    
    console.log('Updated story parameters:', storyState.currentParams);
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
    return storyState.currentStory ? { ...storyState.currentStory } : null;
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