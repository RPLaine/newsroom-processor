/**
 * Application UI builder
 * 
 * Creates the main application UI components
 */
import appState from './state.js';
import { switchTab } from './ui.js';

/**
 * Create the application UI components and add them to the provided container
 * 
 * @param {HTMLElement} container - The container to add UI components to (optional)
 * @returns {HTMLElement} The container with UI components
 */
export function createApplicationUI(container) {
    // Use the provided container or create a new div
    const appContainer = container || document.createElement('div');
    
    // Add app components directly to the container
    appContainer.appendChild(createHeader());
    appContainer.appendChild(createTabs());
    appContainer.appendChild(createTabContent());
    appContainer.appendChild(createNotifications());
    
    return appContainer;
}

/**
 * Create application header
 * 
 * @returns {HTMLElement} The header element
 */
function createHeader() {
    const header = document.createElement('header');
    header.className = 'app-header';
    
    const title = document.createElement('h1');
    title.textContent = 'AI Document Processor';
    header.appendChild(title);
    
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Logout';
    logoutButton.className = 'logout-btn';
    header.appendChild(logoutButton);
    
    return header;
}

/**
 * Create tabs navigation
 * 
 * @returns {HTMLElement} The tabs element
 */
function createTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    
    const tabs = [
        { id: 'jobs', label: 'Jobs' },
        { id: 'inputs', label: 'Inputs' },
        { id: 'process', label: 'Process' },
        { id: 'outputs', label: 'Outputs' }
    ];
    
    tabs.forEach(tabInfo => {
        const tab = document.createElement('button');
        tab.id = `${tabInfo.id}-tab`;
        tab.className = `tab ${tabInfo.id === appState.activeTab ? 'active' : ''}`;
        tab.textContent = tabInfo.label;
        tab.addEventListener('click', () => switchTab(tabInfo.id));
        tabsContainer.appendChild(tab);
    });
    
    return tabsContainer;
}

/**
 * Create tab content containers
 * 
 * @returns {HTMLElement} The tab content container
 */
function createTabContent() {
    const contentContainer = document.createElement('div');
    contentContainer.className = 'tab-content-container';
    
    // Jobs tab content
    const jobsContent = document.createElement('div');
    jobsContent.id = 'jobs-content';
    jobsContent.className = `tab-content ${appState.activeTab === 'jobs' ? 'active' : ''}`;
    jobsContent.innerHTML = `
        <div class="section">
            <h2>Create New Job</h2>
            <form id="create-job-form" class="form">
                <div class="form-group">
                    <label for="job-title">Name</label>
                    <input type="text" id="job-title" required>
                </div>
                <button type="submit" class="btn primary">Create Job</button>
            </form>
        </div>
        <div class="section">
            <h2>Your Jobs</h2>
            <div id="jobs-list" class="jobs-list">
                <p>Loading jobs...</p>
            </div>
        </div>
    `;
    contentContainer.appendChild(jobsContent);
    
    // Inputs tab content
    const inputsContent = document.createElement('div');
    inputsContent.id = 'inputs-content';
    inputsContent.className = `tab-content ${appState.activeTab === 'inputs' ? 'active' : ''}`;
    inputsContent.innerHTML = `
        <div class="section">
            <h2>Add Web Search</h2>
            <form id="web-search-form" class="form">
                <div class="form-group">
                    <label for="search-query">Search Query</label>
                    <input type="text" id="search-query" required>
                </div>
                <button type="submit" class="btn primary">Search Web</button>
            </form>
        </div>
        <div class="section">
            <h2>Add RSS Feed</h2>
            <form id="rss-form" class="form">
                <div class="form-group">
                    <label for="rss-url">RSS URL</label>
                    <input type="url" id="rss-url" required>
                </div>
                <button type="submit" class="btn primary">Process RSS</button>
            </form>
        </div>
        <div class="section">
            <h2>Upload File</h2>
            <form id="file-form" class="form">
                <div class="form-group">
                    <label for="file-input">Select File</label>
                    <input type="file" id="file-input" required>
                </div>
                <button type="submit" class="btn primary">Upload File</button>
            </form>
        </div>
        <div class="section">
            <h2>Current Inputs</h2>
            <div id="inputs-list" class="inputs-list"></div>
        </div>
    `;
    contentContainer.appendChild(inputsContent);
    
    // Process tab content
    const processContent = document.createElement('div');
    processContent.id = 'process-content';
    processContent.className = `tab-content ${appState.activeTab === 'process' ? 'active' : ''}`;
    processContent.innerHTML = `
        <div class="section">
            <h2>Prompt AI Assistant</h2>
            <form id="prompt-form" class="form">
                <div class="form-group">
                    <label for="user-prompt">Enter Prompt</label>
                    <textarea id="user-prompt" rows="4" required></textarea>
                </div>
                <button type="submit" class="btn primary">Send Prompt</button>
            </form>
        </div>
        <div class="section">
            <h2>Automated Processing</h2>
            <div class="button-group">
                <button id="refine-btn" class="btn">Auto-Refine Inputs</button>
                <button id="reflect-btn" class="btn">Generate Self-Reflection</button>
            </div>
        </div>
        <div class="section">
            <h2>Conversation</h2>
            <div id="conversation-area" class="conversation-area"></div>
        </div>
    `;
    contentContainer.appendChild(processContent);
    
    // Outputs tab content
    const outputsContent = document.createElement('div');
    outputsContent.id = 'outputs-content';
    outputsContent.className = `tab-content ${appState.activeTab === 'outputs' ? 'active' : ''}`;
    outputsContent.innerHTML = `
        <div class="section">
            <h2>Create Output</h2>
            <form id="create-output-form" class="form">
                <div class="form-group">
                    <label for="output-name">File Name</label>
                    <input type="text" id="output-name" required>
                </div>
                <div class="form-group">
                    <label for="output-content">Content</label>
                    <textarea id="output-content" rows="8" required></textarea>
                </div>
                <button type="submit" class="btn primary">Save Output</button>
            </form>
        </div>
        <div class="section">
            <h2>Saved Outputs</h2>
            <div id="outputs-list" class="outputs-list"></div>
        </div>
    `;
    contentContainer.appendChild(outputsContent);
    
    return contentContainer;
}

/**
 * Create notifications container
 * 
 * @returns {HTMLElement} The notifications container
 */
function createNotifications() {
    const notificationsContainer = document.createElement('div');
    notificationsContainer.id = 'notification-container';
    notificationsContainer.className = 'notification-container';
    return notificationsContainer;
}