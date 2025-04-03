import appState from './state.js';
import { switchTab } from './ui.js';

export function createApplicationUI(container) {
    const appContainer = container || document.createElement('div');
    
    appContainer.appendChild(createHeader());
    appContainer.appendChild(createTabs());
    appContainer.appendChild(createTabContent());
    
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
            <div class="button-group">
                <button id="refresh-structures-btn" class="btn" data-button-type="refresh-structures-btn">Refresh</button>
            </div>
        </div>
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
        <div class="section full-width" id="node-info-section">
            <h2>Selected Node</h2>
            <div id="selected-node-info">
                <p class="empty-state">No node selected. Please select a node from the list.</p>
            </div>
            <div id="node-tools-container" style="display: none;">
                <h3>Node Tools</h3>
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
                <div id="node-actions-container">
                    <div id="inputs-list" class="inputs-list"></div>
                </div>
            </div>
        </div>
    `;
    contentContainer.appendChild(inputsContent);
    
    const processContent = document.createElement('div');
    processContent.id = 'process-content';
    processContent.className = `tab-content ${appState.activeTab === 'process' ? 'active' : ''}`;
    processContent.innerHTML = `
        <div class="section full-width">
            <div class="button-group">
                <button id="start-process-btn" class="btn start-process-btn" data-button-type="start-process-btn">Start</button>            </div>
        </div>
        <div class="section full-width">
            <h2>Workflow</h2>
            <div id="workflow-container" class="workflow-container">
                <div id="current-node-display" class="current-node-display">
                    <p class="empty-state">No active node. Start the process to begin the workflow.</p>
                </div>
                <div id="workflow-area" class="workflow-area">
                    <p class="empty-state">No structure selected. Please select a structure from the Structures tab before starting a process.</p>
                </div>
            </div>
        </div>
    `;
    contentContainer.appendChild(processContent);
    
    const outputsContent = document.createElement('div');
    outputsContent.id = 'outputs-content';
    outputsContent.className = `tab-content ${appState.activeTab === 'outputs' ? 'active' : ''}`;
    outputsContent.innerHTML = `
        <div class="section full-width">
            <div class="button-group">
                <button id="refresh-outputs-btn" class="btn">Refresh</button>
            </div>
        </div>
        <div class="section full-width">
            <h2>Files</h2>
            <div id="outputs-list" class="outputs-list">
                <p class="empty-state">No files available. Files will appear here after processing your structure.</p>
            </div>
        </div>
    `;
    contentContainer.appendChild(outputsContent);
    
    return contentContainer;
}