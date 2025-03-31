/**
 * StorytellingManager.js - Manages storytelling elements
 * Enhances user experience with immersive storytelling effects
 */

export class StorytellingManager {
    constructor() {
        this.storyPrompts = [
            "What if you could reshape reality with your thoughts?",
            "In a world where dreams become tangible...",
            "When ancient magic meets modern technology...",
            "Discover universes beyond imagination...",
            "Every choice creates a new timeline...",
            "What lies beyond the veil of perception?",
            "Your story is waiting to be written...",
            "This moment could change everything...",
            "The journey of a thousand worlds begins with a single choice...",
            "Unlock the door to infinite possibilities..."
        ];
    }

    /**
     * Initialize storytelling elements in the UI
     */
    initialize() {
        // Start cycling through story prompts
        this.cycleStoryPrompts();
        
        // Add hover effects to storytelling text
        this.addStorytellingEffects();
    }
    
    /**
     * Cycle through different story prompts to create dynamic experience
     */
    cycleStoryPrompts() {
        const storyPromptElement = document.querySelector('.storytelling-text p');
        if (!storyPromptElement) return;
        
        let currentIndex = 0;
        
        // Set initial text
        storyPromptElement.textContent = this.storyPrompts[currentIndex];
        
        // Cycle prompts every 8 seconds
        setInterval(() => {
            // Fade out
            storyPromptElement.style.opacity = 0;
            
            // Change text after fade out
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % this.storyPrompts.length;
                storyPromptElement.textContent = this.storyPrompts[currentIndex];
                
                // Fade in
                storyPromptElement.style.opacity = 1;
            }, 500);
        }, 8000);
    }
    
    /**
     * Add hover effects to storytelling elements
     */
    addStorytellingEffects() {
        // Add profound hover state to storytelling text
        const storyText = document.querySelector('.storytelling-text p');
        if (storyText) {
            // Apply more dramatic styles on hover
            storyText.addEventListener('mouseenter', () => {
                storyText.style.textShadow = '0 0 20px rgba(255, 204, 0, 0.4)';
                storyText.style.transform = 'scale(1.01)';
                storyText.style.transition = 'all 0.7s ease';
            });
            
            storyText.addEventListener('mouseleave', () => {
                storyText.style.textShadow = '';
                storyText.style.transform = '';
            });
        }
    }
}