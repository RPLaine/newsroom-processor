/**
 * GameGen2 Styling Module
 * 
 * This module handles theme management and dynamic styling for the application.
 * It provides functions for loading and switching themes, and initializing style-related functionality.
 */

/**
 * Available themes in the application
 */
const themes = {
    default: {
        name: 'Default',
        colorPrimary: '#3498db',
        colorSecondary: '#2ecc71',
        colorAccent: '#9b59b6'
    },
    dark: {
        name: 'Dark',
        colorPrimary: '#2980b9',
        colorSecondary: '#27ae60',
        colorAccent: '#8e44ad'
    },
    fantasy: {
        name: 'Fantasy',
        colorPrimary: '#8e44ad',
        colorSecondary: '#27ae60',
        colorAccent: '#e67e22'
    },
    scifi: {
        name: 'Sci-Fi',
        colorPrimary: '#3498db',
        colorSecondary: '#1abc9c',
        colorAccent: '#e74c3c'
    }
};

/**
 * Current active theme
 */
let currentTheme = 'default';

/**
 * Initialize styling for the application
 * 
 * @param {Object} options - Configuration options
 * @returns {Promise<void>}
 */
async function initStyling(options = {}) {
    console.log('Initializing styling module...');
    
    try {
        // Load theme from storage or options
        const savedTheme = localStorage.getItem('gamegen2-theme') || options.defaultTheme || 'default';
        
        // Apply theme
        await changeTheme(savedTheme);
        
        // Initialize theme toggle if present in the DOM
        initThemeToggle();
        
        console.log('Styling module initialized with theme:', currentTheme);
    } catch (error) {
        console.error('Error initializing styling:', error);
    }
}

/**
 * Change the current theme
 * 
 * @param {string} themeName - Name of the theme to apply
 * @returns {Promise<boolean>} - Success status
 */
async function changeTheme(themeName) {
    // Validate theme exists
    if (!themes[themeName]) {
        console.error(`Theme "${themeName}" does not exist`);
        return false;
    }
    
    try {
        // Remove old theme class if any
        document.body.classList.remove(`theme-${currentTheme}`);
        
        // Add new theme class
        document.body.classList.add(`theme-${themeName}`);
        
        // Update current theme
        currentTheme = themeName;
        
        // Save to local storage
        localStorage.setItem('gamegen2-theme', themeName);
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: themeName }
        }));
        
        // Convert theme RGB values to CSS variables
        updateThemeColors(themes[themeName]);
        
        return true;
    } catch (error) {
        console.error('Error changing theme:', error);
        return false;
    }
}

/**
 * Update CSS variables with theme colors
 * 
 * @param {Object} theme - Theme object with color properties
 */
function updateThemeColors(theme) {
    // Helper function to convert hex to rgb
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    
    // Convert hex colors to rgb for CSS variables
    if (theme.colorPrimary) {
        const rgb = hexToRgb(theme.colorPrimary);
        if (rgb) {
            document.documentElement.style.setProperty('--color-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
    }
    
    if (theme.colorSecondary) {
        const rgb = hexToRgb(theme.colorSecondary);
        if (rgb) {
            document.documentElement.style.setProperty('--color-secondary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
    }
    
    if (theme.colorAccent) {
        const rgb = hexToRgb(theme.colorAccent);
        if (rgb) {
            document.documentElement.style.setProperty('--color-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
    }
}

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
    // Find theme toggle buttons
    document.querySelectorAll('[data-theme]').forEach(button => {
        // Set initial active state based on current theme
        if (button.dataset.theme === currentTheme) {
            button.classList.add('active');
        }
        
        // Add click handler
        button.addEventListener('click', () => {
            const newTheme = button.dataset.theme;
            if (newTheme && newTheme !== currentTheme) {
                changeTheme(newTheme);
                
                // Update button states
                document.querySelectorAll('[data-theme]').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.theme === newTheme);
                });
            }
        });
    });
}

/**
 * Load a theme from a JSON file
 * 
 * @param {string} themePath - Path to the theme JSON file
 * @returns {Promise<Object>} - Theme object
 */
async function loadThemeFromFile(themePath) {
    try {
        const response = await fetch(themePath);
        if (!response.ok) {
            throw new Error(`Failed to load theme: ${response.status} ${response.statusText}`);
        }
        
        const themeData = await response.json();
        return themeData;
    } catch (error) {
        console.error('Error loading theme from file:', error);
        return null;
    }
}

/**
 * Register a new theme
 * 
 * @param {string} themeName - Name of the theme
 * @param {Object} themeData - Theme configuration object
 * @returns {boolean} - Success status
 */
function registerTheme(themeName, themeData) {
    if (!themeName || typeof themeName !== 'string') {
        console.error('Invalid theme name');
        return false;
    }
    
    if (!themeData || typeof themeData !== 'object') {
        console.error('Invalid theme data');
        return false;
    }
    
    // Add theme to available themes
    themes[themeName] = {
        name: themeData.name || themeName,
        colorPrimary: themeData.colorPrimary || '#3498db',
        colorSecondary: themeData.colorSecondary || '#2ecc71',
        colorAccent: themeData.colorAccent || '#9b59b6',
        ...themeData
    };
    
    console.log(`Registered theme: ${themeName}`);
    return true;
}

/**
 * Get the current theme name
 * 
 * @returns {string} Current theme name
 */
function getCurrentTheme() {
    return currentTheme;
}

/**
 * Get available theme names
 * 
 * @returns {Array<string>} List of available theme names
 */
function getAvailableThemes() {
    return Object.keys(themes);
}

// Export functions to global scope for use in other modules
window.initStyling = initStyling;
window.changeTheme = changeTheme;
window.loadThemeFromFile = loadThemeFromFile;
window.registerTheme = registerTheme;
window.getCurrentTheme = getCurrentTheme;
window.getAvailableThemes = getAvailableThemes;