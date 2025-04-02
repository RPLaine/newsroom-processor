import appState from './state.js';
import { switchTab } from './ui.js';

export function createApplicationUI(container) {
    const appContainer = container || document.createElement('div');
    
    appContainer.appendChild(createHeader());
    appContainer.appendChild(createTabs());
    appContainer.appendChild(createTabContent());
    appContainer.appendChild(createNotifications());
    
    return appContainer;
}

function createHeader() {
    const header = document.createElement('header');
    header.className = 'app-header';
    
    const title = document.createElement('h1');
    title.textContent = 'AI Processor Agent';
    header.appendChild(title);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'header-buttons';
    
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Logout';
    logoutButton.className = 'logout-btn';
    buttonsContainer.appendChild(logoutButton);
    
    header.appendChild(buttonsContainer);
    
    return header;
}

function createTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    
    const tabs = [
        { id: 'structures', label: 'Structures' },
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

function createTabContent() {
    const contentContainer = document.createElement('div');
    contentContainer.className = 'tab-content-container';
    
    const structuresContent = document.createElement('div');
    structuresContent.id = 'structures-content';
    structuresContent.className = `tab-content ${appState.activeTab === 'structures' ? 'active' : ''}`;
    structuresContent.innerHTML = `
        <div class="section full-width">
            <div id="structures-list" class="structures-list">
                <p>Loading structures from johto.online...</p>
            </div>
        </div>
    `;
    contentContainer.appendChild(structuresContent);
    
    const inputsContent = document.createElement('div');
    inputsContent.id = 'inputs-content';
    inputsContent.className = `tab-content ${appState.activeTab === 'inputs' ? 'active' : ''}`;
    inputsContent.innerHTML = `
        <div class="section full-width" id="structure-info-section">
            <h2>Selected Structure</h2>
            <div id="selected-structure-info">
                <p class="empty-state">No structure selected. Please select a structure from the Structures tab.</p>
            </div>
        </div>
        <div class="section full-width">
            <h2>Tools</h2>
            <div class="collapsible-section">
                <h4 class="collapsible-heading">
                    Add Web Search <span class="toggle-icon">▶</span>
                </h4>
                <div class="collapsible-content collapsed">
                    <form id="web-search-form" class="form">
                        <div class="form-group">
                            <label for="search-query">Search Query</label>
                            <input type="text" id="search-query" required>
                        </div>
                        <button type="submit" class="btn primary">Search Web</button>
                    </form>
                </div>
            </div>
            <div class="collapsible-section">
                <h4 class="collapsible-heading">
                    Add RSS Feed <span class="toggle-icon">▶</span>
                </h4>
                <div class="collapsible-content collapsed">
                    <form id="rss-form" class="form">
                        <div class="form-group">
                            <label for="rss-url">RSS URL</label>
                            <input type="url" id="rss-url" required>
                        </div>
                        <button type="submit" class="btn primary">Process RSS</button>
                    </form>
                </div>
            </div>
            <div class="collapsible-section">
                <h4 class="collapsible-heading">
                    Upload File <span class="toggle-icon">▶</span>
                </h4>
                <div class="collapsible-content collapsed">
                    <form id="file-form" class="form">
                        <div class="form-group">
                            <label for="file-input">Select File</label>
                            <input type="file" id="file-input" required>
                        </div>
                        <button type="submit" class="btn primary">Upload File</button>
                    </form>
                </div>
            </div>
        </div>
        <div class="section full-width">
            <h2>Current Inputs</h2>
            <div id="inputs-list" class="inputs-list"></div>
        </div>
    `;
    contentContainer.appendChild(inputsContent);
    
    const processContent = document.createElement('div');
    processContent.id = 'process-content';
    processContent.className = `tab-content ${appState.activeTab === 'process' ? 'active' : ''}`;
    processContent.innerHTML = `
        <div class="section medium">
            <h2>Prompt AI Assistant</h2>
            <form id="prompt-form" class="form">
                <div class="form-group">
                    <label for="user-prompt">Enter Prompt</label>
                    <textarea id="user-prompt" rows="4" required></textarea>
                </div>
                <button type="submit" class="btn primary">Send Prompt</button>
            </form>
        </div>
        <div class="section medium">
            <h2>Automated Processing</h2>
            <div class="button-group">
                <button id="refine-btn" class="btn">Auto-Refine Inputs</button>
                <button id="reflect-btn" class="btn">Generate Self-Reflection</button>
            </div>
        </div>
        <div class="section full-width">
            <h2>Conversation</h2>
            <div id="conversation-area" class="conversation-area"></div>
        </div>
    `;
    contentContainer.appendChild(processContent);
    
    const outputsContent = document.createElement('div');
    outputsContent.id = 'outputs-content';
    outputsContent.className = `tab-content ${appState.activeTab === 'outputs' ? 'active' : ''}`;
    outputsContent.innerHTML = `
        <div class="section medium">
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
        <div class="section full-width">
            <h2>Saved Outputs</h2>
            <div id="outputs-list" class="outputs-list"></div>
        </div>
    `;
    contentContainer.appendChild(outputsContent);
    
    return contentContainer;
}

function createNotifications() {
    const notificationsContainer = document.createElement('div');
    notificationsContainer.id = 'notification-container';
    notificationsContainer.className = 'notification-container';
    return notificationsContainer;
}