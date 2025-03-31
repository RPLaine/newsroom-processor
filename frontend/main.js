import Config from './config.js';

console.log('Config:', Config);
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    console.log('Initializing application...');
    const request_data = {
        action: 'application_init'
    };
    let data = await FetchData(request_data);
}

async function FetchData(request_data, content_type = 'application/json') {
    console.log('Fetching data...');
    try {
        const response = await fetch(Config.host, {
            method: 'POST',
            headers: {
                'Content-Type': content_type
            },
            body: JSON.stringify(request_data)
        });
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            error: 'Failed to fetch user data'
        };
    }
}

// /**
//  * Load a module and its dependencies
//  * 
//  * @param {string} moduleName - Name of the module to load
//  * @returns {Promise<void>}
//  */
// async function loadModule(moduleName) {
//     if (Config.modules[moduleName]) {
//         console.log(`Module ${moduleName} already loaded.`);
//         return;
//     }
    
//     try {
//         console.log(`Loading module: ${moduleName}...`);
        
//         // Load module script
//         const moduleScript = document.createElement('script');
//         moduleScript.src = `${moduleName}/${moduleName}.js`;
//         moduleScript.async = true;
        
//         // Wait for the script to load
//         await new Promise((resolve, reject) => {
//             moduleScript.onload = resolve;
//             moduleScript.onerror = () => reject(new Error(`Failed to load ${moduleName} module`));
//             document.head.appendChild(moduleScript);
//         });
        
//         // Initialize the module
//         if (typeof window[`init${capitalizeFirstLetter(moduleName)}Module`] === 'function') {
//             await window[`init${capitalizeFirstLetter(moduleName)}Module`](Config);
//             Config.modules[moduleName] = true;
//             console.log(`Module ${moduleName} loaded successfully.`);
//         } else {
//             throw new Error(`Module ${moduleName} does not have an initialization function.`);
//         }
//     } catch (error) {
//         console.error(`Error loading module ${moduleName}:`, error);
//         throw error;
//     }
// }

// /**
//  * Switch to a different module
//  * 
//  * @param {string} moduleName - Name of the module to switch to
//  * @returns {Promise<void>}
//  */
// async function switchModule(moduleName) {
//     // Clear the current content
//     const appContainer = document.getElementById('app-container') || createAppContainer();
//     appContainer.innerHTML = '';
    
//     // Load the new module if not already loaded
//     if (!Config.modules[moduleName]) {
//         await loadModule(moduleName);
//     }
    
//     // Initialize the view for this module
//     if (typeof window[`show${capitalizeFirstLetter(moduleName)}View`] === 'function') {
//         await window[`show${capitalizeFirstLetter(moduleName)}View`](appContainer);
//         Config.currentModule = moduleName;
//     } else {
//         throw new Error(`Module ${moduleName} does not have a view initialization function.`);
//     }
// }

// /**
//  * Create the main application container if it doesn't exist
//  * 
//  * @returns {HTMLElement} The app container element
//  */
// function createAppContainer() {
//     const appContainer = document.createElement('div');
//     appContainer.id = 'app-container';
//     document.body.appendChild(appContainer);
//     return appContainer;
// }

// /**
//  * Display an error message to the user
//  * 
//  * @param {string} message - Error message to display
//  */
// function displayErrorMessage(message) {
//     const errorDiv = document.createElement('div');
//     errorDiv.className = 'error-message';
//     errorDiv.textContent = message;
    
//     const appContainer = document.getElementById('app-container') || createAppContainer();
//     appContainer.appendChild(errorDiv);
    
//     // Auto-remove after 5 seconds
//     setTimeout(() => {
//         if (errorDiv && errorDiv.parentNode) {
//             errorDiv.parentNode.removeChild(errorDiv);
//         }
//     }, 5000);
// }

// /**
//  * Utility function to capitalize the first letter of a string
//  * 
//  * @param {string} string - String to capitalize
//  * @returns {string} Capitalized string
//  */
// function capitalizeFirstLetter(string) {
//     return string.charAt(0).toUpperCase() + string.slice(1);
// }

// Initialize the application once the DOM is fully loaded


// // Expose key functions to the global scope for module interaction
// window.GameGen2 = Config;
// window.switchModule = switchModule;
// window.displayErrorMessage = displayErrorMessage;