/**
 * Creates tabbed interface component
 * 
 * @returns {HTMLElement} The tabs navigation element
 */
export function createTabs() {
    // Create tabs container
    const tabs = document.createElement('div');
    tabs.className = 'tabs';
    
    // Login tab
    const loginTab = document.createElement('button');
    loginTab.className = 'tab active';
    loginTab.dataset.tab = 'login';
    loginTab.textContent = 'Login';
    tabs.appendChild(loginTab);
    
    // Register tab
    const registerTab = document.createElement('button');
    registerTab.className = 'tab';
    registerTab.dataset.tab = 'register';
    registerTab.textContent = 'Register';
    tabs.appendChild(registerTab);
    
    return tabs;
}

/**
 * Creates a tab content container
 * 
 * @param {string} id - ID for the tab content
 * @param {boolean} isActive - Whether this tab is initially active
 * @returns {HTMLElement} The tab content container
 */
export function createTabContent(id, isActive = false) {
    const tabContent = document.createElement('div');
    tabContent.className = isActive ? 'tab-content active' : 'tab-content';
    tabContent.id = `${id}-tab`;
    
    return tabContent;
}