/**
 * GameGen2 Storytelling Module
 * 
 * This module handles all functionality related to story generation,
 * continuation, and management.
 */

// Current story state
const storyState = {
    currentStory: null,
    currentStoryId: null,
    genre: 'fantasy',
    style: 'descriptive',
    temperature: 0.7,
    storyContent: '',
    isGenerating: false
};

/**
 * Initialize the storytelling module
 * 
 * @param {Object} options - Configuration options
 * @returns {Promise<void>}
 */
async function initStorytelling(options = {}) {
    console.log('Initializing storytelling module...');
    
    // Set initial configuration
    storyState.genre = options.genre || 'fantasy';
    storyState.style = options.style || 'descriptive';
    storyState.temperature = options.temperature || 0.7;
    
    // Register event listeners
    window.addEventListener('app:ready', () => {
        console.log('Storytelling module ready');
    });
    
    console.log('Storytelling module initialized');
    return Promise.resolve();
}

/**
 * Create a new story
 * 
 * @param {string} prompt - Initial story prompt
 * @param {Object} options - Story options
 * @returns {Promise<Object>} - Created story object
 */
async function createStory(prompt, options = {}) {
    if (!prompt) {
        throw new Error('Prompt is required to create a story');
    }
    
    try {
        console.log(`Creating new story with prompt: ${prompt}`);
        storyState.isGenerating = true;
        
        // Set genre if provided
        if (options.genre) {
            storyState.genre = options.genre;
        }
        
        // Simulate API call to create story
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'create_story',
                prompt: prompt,
                genre: storyState.genre,
                style: storyState.style,
                temperature: storyState.temperature
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Update story state
            storyState.currentStory = data.story;
            storyState.currentStoryId = data.story.id;
            storyState.storyContent = data.story.content;
            
            // Update UI
            updateStoryUI(data.story.content);
            
            return data.story;
        } else {
            throw new Error(data.message || 'Failed to create story');
        }
    } catch (error) {
        console.error('Error creating story:', error);
        throw error;
    } finally {
        storyState.isGenerating = false;
    }
}

/**
 * Continue an existing story
 * 
 * @param {string} userInput - User's continuation text
 * @returns {Promise<Object>} - Updated story object
 */
async function continueStory(userInput) {
    if (!userInput) {
        throw new Error('User input is required to continue the story');
    }
    
    if (!storyState.currentStoryId) {
        throw new Error('No active story to continue');
    }
    
    try {
        console.log(`Continuing story with input: ${userInput}`);
        storyState.isGenerating = true;
        
        // Simulate API call to continue story
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'continue_story',
                story_id: storyState.currentStoryId,
                user_input: userInput
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Update story state
            storyState.storyContent = data.story.content;
            
            // Update UI
            updateStoryUI(data.story.content);
            
            return data.story;
        } else {
            throw new Error(data.message || 'Failed to continue story');
        }
    } catch (error) {
        console.error('Error continuing story:', error);
        throw error;
    } finally {
        storyState.isGenerating = false;
    }
}

/**
 * Load an existing story by ID
 * 
 * @param {string} storyId - ID of the story to load
 * @returns {Promise<Object>} - Loaded story object
 */
async function loadStory(storyId) {
    if (!storyId) {
        throw new Error('Story ID is required');
    }
    
    try {
        console.log(`Loading story with ID: ${storyId}`);
        
        // Simulate API call to load story
        const response = await fetch('/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'get_story',
                story_id: storyId
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Update story state
            storyState.currentStory = data.story;
            storyState.currentStoryId = data.story.id;
            storyState.storyContent = data.story.content;
            storyState.genre = data.story.genre || storyState.genre;
            
            // Update UI
            updateStoryUI(data.story.content);
            
            return data.story;
        } else {
            throw new Error(data.message || 'Failed to load story');
        }
    } catch (error) {
        console.error('Error loading story:', error);
        throw error;
    }
}

/**
 * Update the story UI with content
 * 
 * @param {string} content - Story content to display
 */
function updateStoryUI(content) {
    const storyContentElement = document.getElementById('story-content');
    if (storyContentElement) {
        storyContentElement.innerHTML = formatStoryContent(content);
        
        // Show story controls
        const storyControls = document.getElementById('story-controls');
        if (storyControls) {
            storyControls.classList.remove('hidden');
        }
    }
}

/**
 * Format story content for display
 * 
 * @param {string} content - Raw story content
 * @returns {string} - Formatted HTML
 */
function formatStoryContent(content) {
    if (!content) return '<p>No story content</p>';
    
    // Split by paragraphs and create proper HTML
    return content.split('\n\n')
        .map(paragraph => `<p>${paragraph.trim()}</p>`)
        .join('');
}

// Expose functions to global scope
window.initStorytelling = initStorytelling;
window.createStory = createStory;
window.continueStory = continueStory;
window.loadStory = loadStory;

// Export the module
export default {
    initStorytelling,
    createStory,
    continueStory,
    loadStory
};