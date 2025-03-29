/**
 * Main JavaScript entry point for GameGen2
 * This file loads and initializes all other JavaScript modules
 */

// Import module functions (would use ES6 import syntax in a bundled environment)
document.addEventListener('DOMContentLoaded', function() {
    // Load styling module
    loadScript('styling/styling.js');
    
    // Load authentication module
    loadScript('login/login.js', function() {
        // After login script loads, initialize auth module
        if (typeof authManager !== 'undefined') {
            authManager.checkAuthentication();
        }
    });
    
    // Load background effect
    loadScript('login/webgpu-background.js');
    
    // Load main application script last
    loadScript('script.js', function() {
        // Initialize story engine after the script is loaded
        if (typeof StorytellingEngine !== 'undefined') {
            window.storyEngine = new StorytellingEngine();
        }
    });
});

/**
 * Helper function to dynamically load scripts
 * @param {string} src - Script source path
 * @param {Function} callback - Optional callback after script loads
 */
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    
    if (callback) {
        script.onload = callback;
    }
    
    script.async = false; // Maintain execution order
    document.body.appendChild(script);
}