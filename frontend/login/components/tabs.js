export function createTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs';
    
    const loginTab = document.createElement('button');
    loginTab.id = 'login-tab';
    loginTab.className = 'tab active';
    loginTab.textContent = 'Login';
    
    const registerTab = document.createElement('button');
    registerTab.id = 'register-tab';
    registerTab.className = 'tab';
    registerTab.textContent = 'Register';
    
    tabsContainer.appendChild(loginTab);
    tabsContainer.appendChild(registerTab);
    
    return tabsContainer;
}

export function createTabContent(id, isActive = false) {
    const tabContent = document.createElement('div');
    tabContent.id = `${id}-content`;
    tabContent.className = `tab-content ${isActive ? 'active' : ''}`;
    
    return tabContent;
}