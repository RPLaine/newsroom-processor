import appState from './state.js';
import { navigateToView, showNotification, showError } from './utils.js';
import { createJob, continueJob, getJobs, deleteJob, searchWeb, readRSS, loadFile, processData, saveOutput } from './apiMethods.js';
import { formatDate } from '../../utils.js';

function initializeEventHandlersWithApi(fetchData) {
    // Document navigation event handlers
    document.getElementById('documents-nav-link')?.addEventListener('click', async () => {
        try {
            const response = await getJobs(fetchData);
            
            if (response.status === 'success' && response.data?.jobs) {
                updateDocumentsList(response.data.jobs);
            } else {
                throw new Error(response.message || 'Failed to load documents');
            }
        } catch (error) {
            showError('Failed to load documents', error);
        }
    });

    // Dashboard - "Create New Document" button
    document.getElementById('new-document-btn')?.addEventListener('click', () => {
        navigateToView('create');
    });

    // Create document form submission
    document.getElementById('create-document-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const title = document.getElementById('document-title').value;
            const description = document.getElementById('document-description').value;
            const jobType = document.getElementById('document-type').value;
            
            if (!title) {
                showError('Document title is required');
                return;
            }
            
            const jobData = {
                title: title,
                description: description,
                job_type: jobType
            };
            
            const response = await createJob(jobData, fetchData);
            
            if (response.status === 'success' && response.data?.job) {
                showNotification('Document created successfully', 'success');
                
                // Store the current job in state
                appState.currentJob = response.data.job;
                
                // Navigate to document view
                navigateToView('document');
                
                // Update document info
                updateDocumentInfo(response.data.job);
            } else {
                throw new Error(response.message || 'Failed to create document');
            }
        } catch (error) {
            showError('Error creating document', error);
        }
    });

    // Document tabs navigation
    document.querySelectorAll('.document-tabs a').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs and tab contents
            document.querySelectorAll('.document-tabs a').forEach(t => {
                t.classList.remove('active');
            });
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Get the tab content ID based on tab ID
            const contentId = tab.id.replace('-tab', '-content');
            document.getElementById(contentId)?.classList.add('active');
        });
    });

    // Prompt form submission
    document.getElementById('prompt-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const prompt = document.getElementById('user-prompt').value;
            
            if (!prompt || !appState.currentJob) {
                return;
            }
            
            // Show user message in conversation area
            addMessageToConversation('user', prompt);
            
            // Clear prompt input
            document.getElementById('user-prompt').value = '';
            
            // Show loading message
            const loadingId = addMessageToConversation('system', 'Processing your request...');
            
            const response = await processData({
                job_id: appState.currentJob.id,
                processing_type: 'prompt',
                prompt: prompt
            }, fetchData);
            
            // Remove loading message
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                // Update the current job in state
                appState.currentJob = response.data.job;
                
                // Add assistant response to conversation
                addMessageToConversation('assistant', response.data.assistant_response);
            } else {
                throw new Error(response.message || 'Failed to process prompt');
            }
        } catch (error) {
            showError('Error processing prompt', error);
        }
    });

    // Auto-refine button
    document.getElementById('refine-btn')?.addEventListener('click', async () => {
        try {
            if (!appState.currentJob) {
                showError('No active document');
                return;
            }
            
            // Show loading message
            const loadingId = addMessageToConversation('system', 'Automatically refining document content...');
            
            const response = await processData({
                job_id: appState.currentJob.id,
                processing_type: 'refine'
            }, fetchData);
            
            // Remove loading message
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                // Update the current job in state
                appState.currentJob = response.data.job;
                
                // Add assistant response to conversation
                addMessageToConversation('system', 'Auto-refinement complete:');
                addMessageToConversation('assistant', response.data.assistant_response);
                
                showNotification('Document automatically refined', 'success');
            } else {
                throw new Error(response.message || 'Failed to refine document');
            }
        } catch (error) {
            showError('Error refining document', error);
        }
    });

    // Self-reflect button
    document.getElementById('reflect-btn')?.addEventListener('click', async () => {
        try {
            if (!appState.currentJob) {
                showError('No active document');
                return;
            }
            
            // Show loading message
            const loadingId = addMessageToConversation('system', 'Generating self-reflection on document progress...');
            
            const response = await processData({
                job_id: appState.currentJob.id,
                processing_type: 'reflect'
            }, fetchData);
            
            // Remove loading message
            removeMessage(loadingId);
            
            if (response.status === 'success' && response.data) {
                // Update the current job in state
                appState.currentJob = response.data.job;
                
                // Add assistant response to conversation
                addMessageToConversation('system', 'Self-reflection complete:');
                addMessageToConversation('assistant', response.data.assistant_response);
                
                showNotification('Self-reflection generated', 'success');
            } else {
                throw new Error(response.message || 'Failed to generate self-reflection');
            }
        } catch (error) {
            showError('Error generating self-reflection', error);
        }
    });

    // Web search form
    document.getElementById('web-search-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const query = document.getElementById('search-query').value;
            
            if (!query || !appState.currentJob) {
                return;
            }
            
            // Show loading in inputs list
            const inputsList = document.getElementById('inputs-list');
            inputsList.innerHTML = '<p>Searching the web...</p>';
            
            const response = await searchWeb({
                query: query,
                job_id: appState.currentJob.id
            }, fetchData);
            
            if (response.status === 'success' && response.data) {
                // Update the current job in state
                appState.currentJob = response.data.job;
                
                // Update inputs list
                updateInputsList(appState.currentJob.inputs);
                
                // Clear search input
                document.getElementById('search-query').value = '';
                
                showNotification('Web search results added', 'success');
            } else {
                throw new Error(response.message || 'Failed to search web');
            }
        } catch (error) {
            showError('Error searching web', error);
        }
    });

    // RSS form submission
    document.getElementById('rss-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const rssUrl = document.getElementById('rss-url').value;
            
            if (!rssUrl || !appState.currentJob) {
                return;
            }
            
            // Show loading in inputs list
            const inputsList = document.getElementById('inputs-list');
            inputsList.innerHTML = '<p>Loading RSS feed...</p>';
            
            const response = await readRSS({
                rss_url: rssUrl,
                job_id: appState.currentJob.id
            }, fetchData);
            
            if (response.status === 'success' && response.data) {
                // Update the current job in state
                appState.currentJob = response.data.job;
                
                // Update inputs list
                updateInputsList(appState.currentJob.inputs);
                
                // Clear RSS input
                document.getElementById('rss-url').value = '';
                
                showNotification('RSS feed added', 'success');
            } else {
                throw new Error(response.message || 'Failed to load RSS feed');
            }
        } catch (error) {
            showError('Error loading RSS feed', error);
        }
    });

    // File upload form
    document.getElementById('file-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const fileInput = document.getElementById('file-input');
            
            if (!fileInput.files[0] || !appState.currentJob) {
                return;
            }
            
            const file = fileInput.files[0];
            
            // Read file content
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const fileContent = event.target.result;
                    
                    // Show loading in inputs list
                    const inputsList = document.getElementById('inputs-list');
                    inputsList.innerHTML = '<p>Uploading file...</p>';
                    
                    const response = await loadFile({
                        file_name: file.name,
                        file_content: fileContent,
                        job_id: appState.currentJob.id
                    }, fetchData);
                    
                    if (response.status === 'success' && response.data) {
                        // Update the current job in state
                        appState.currentJob = response.data.job;
                        
                        // Update inputs list
                        updateInputsList(appState.currentJob.inputs);
                        
                        // Clear file input
                        fileInput.value = '';
                        
                        showNotification('File uploaded', 'success');
                    } else {
                        throw new Error(response.message || 'Failed to upload file');
                    }
                } catch (error) {
                    showError('Error uploading file', error);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            showError('Error reading file', error);
        }
    });

    // Output form submission
    document.getElementById('create-output-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const fileName = document.getElementById('output-name').value;
            const content = document.getElementById('output-content').value;
            
            if (!fileName || !content || !appState.currentJob) {
                return;
            }
            
            const response = await saveOutput({
                job_id: appState.currentJob.id,
                file_name: fileName,
                content: content
            }, fetchData);
            
            if (response.status === 'success' && response.data) {
                // Update the current job in state
                appState.currentJob = response.data.job;
                
                // Update outputs list
                updateOutputsList(appState.currentJob.outputs);
                
                // Clear output form
                document.getElementById('output-name').value = '';
                document.getElementById('output-content').value = '';
                
                showNotification('Output saved', 'success');
            } else {
                throw new Error(response.message || 'Failed to save output');
            }
        } catch (error) {
            showError('Error saving output', error);
        }
    });

    // LLM settings form
    document.getElementById('llm-settings-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        try {
            const temperature = document.getElementById('temperature').value;
            const maxLength = document.getElementById('max-length').value;
            
            // Save settings to local storage
            localStorage.setItem('gamegen2-llm-temperature', temperature);
            localStorage.setItem('gamegen2-llm-max-length', maxLength);
            
            showNotification('LLM settings saved', 'success');
        } catch (error) {
            showError('Error saving LLM settings', error);
        }
    });

    // Temperature range input change handler
    document.getElementById('temperature')?.addEventListener('input', (e) => {
        document.getElementById('temp-value').textContent = e.target.value;
    });
}

function updateDocumentsList(documents) {
    const documentsList = document.getElementById('documents-list');
    if (!documentsList) return;
    
    if (!documents || documents.length === 0) {
        documentsList.innerHTML = '<p>No documents found. Create your first document!</p>';
        return;
    }
    
    documentsList.innerHTML = '';
    documents.forEach(doc => {
        const docElement = document.createElement('div');
        docElement.className = 'document-card';
        docElement.dataset.docId = doc.id;
        
        // Format dates
        const createdDate = doc.created_at ? formatDate(new Date(doc.created_at * 1000)) : 'Unknown';
        const modifiedDate = doc.last_modified ? formatDate(new Date(doc.last_modified * 1000)) : 'Unknown';
        
        docElement.innerHTML = `
            <h3>${doc.title || 'Untitled Document'}</h3>
            <p>${doc.description || 'No description'}</p>
            <div class="doc-meta">
                <span>Created: ${createdDate}</span>
                <span>Modified: ${modifiedDate}</span>
            </div>
            <div class="document-actions">
                <button class="btn btn-small btn-primary open-doc-btn">Open</button>
                <button class="btn btn-small btn-danger delete-doc-btn">Delete</button>
            </div>
        `;
        
        documentsList.appendChild(docElement);
    });
    
    // Add event listeners for document actions
    document.querySelectorAll('.open-doc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const docCard = e.target.closest('.document-card');
            const docId = docCard.dataset.docId;
            
            openDocument(docId, documents, fetchData);
        });
    });
    
    document.querySelectorAll('.delete-doc-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (!confirm('Are you sure you want to delete this document?')) {
                return;
            }
            
            const docCard = e.target.closest('.document-card');
            const docId = docCard.dataset.docId;
            
            try {
                const response = await deleteJob(docId, fetchData);
                
                if (response.status === 'success') {
                    // Remove the document card from the list
                    docCard.remove();
                    
                    // Check if there are any documents left
                    if (documentsList.children.length === 0) {
                        documentsList.innerHTML = '<p>No documents found. Create your first document!</p>';
                    }
                    
                    showNotification('Document deleted', 'success');
                } else {
                    throw new Error(response.message || 'Failed to delete document');
                }
            } catch (error) {
                showError('Error deleting document', error);
            }
        });
    });
}

function updateDocumentInfo(job) {
    const documentInfo = document.getElementById('document-info');
    if (!documentInfo || !job) return;
    
    const createdDate = job.created_at ? formatDate(new Date(job.created_at * 1000)) : 'Unknown';
    const modifiedDate = job.last_modified ? formatDate(new Date(job.last_modified * 1000)) : 'Unknown';
    
    documentInfo.innerHTML = `
        <h2>${job.title || 'Untitled Document'}</h2>
        <p>${job.description || 'No description'}</p>
        <div class="doc-meta">
            <span>Type: ${job.type || 'Document'}</span>
            <span>Created: ${createdDate}</span>
            <span>Modified: ${modifiedDate}</span>
        </div>
    `;
    
    // Update conversation area with existing messages
    updateConversationArea(job.conversation || []);
    
    // Update inputs list
    updateInputsList(job.inputs || []);
    
    // Update outputs list
    updateOutputsList(job.outputs || []);
}

function updateConversationArea(conversation) {
    const conversationArea = document.getElementById('conversation-area');
    if (!conversationArea) return;
    
    if (!conversation || conversation.length === 0) {
        conversationArea.innerHTML = '<p class="message system">Start a conversation with the AI assistant.</p>';
        return;
    }
    
    conversationArea.innerHTML = '';
    conversation.forEach(message => {
        if (message.role === 'user' || message.role === 'assistant' || message.role === 'system') {
            addMessageToConversation(message.role, message.content);
        }
    });
    
    // Scroll to bottom of conversation
    conversationArea.scrollTop = conversationArea.scrollHeight;
}

function addMessageToConversation(role, content) {
    const conversationArea = document.getElementById('conversation-area');
    if (!conversationArea) return;
    
    const messageId = 'msg-' + Date.now();
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    messageElement.id = messageId;
    messageElement.innerHTML = `<p>${content}</p>`;
    
    conversationArea.appendChild(messageElement);
    
    // Scroll to bottom of conversation
    conversationArea.scrollTop = conversationArea.scrollHeight;
    
    return messageId;
}

function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

function updateInputsList(inputs) {
    const inputsList = document.getElementById('inputs-list');
    if (!inputsList) return;
    
    if (!inputs || inputs.length === 0) {
        inputsList.innerHTML = '<p>No data sources added yet.</p>';
        return;
    }
    
    inputsList.innerHTML = '';
    inputs.forEach(input => {
        const inputElement = document.createElement('div');
        inputElement.className = 'input-item';
        
        // Format date
        const date = input.timestamp ? formatDate(new Date(input.timestamp * 1000)) : 'Unknown';
        
        let contentPreview = '';
        
        if (input.type === 'web_search') {
            contentPreview = `<strong>Query:</strong> ${input.query}<br>`;
            if (input.results && input.results.length > 0) {
                contentPreview += '<strong>Results:</strong><ul>';
                input.results.forEach(result => {
                    contentPreview += `<li>${result.title}: ${result.snippet}</li>`;
                });
                contentPreview += '</ul>';
            }
        } else if (input.type === 'rss_feed') {
            contentPreview = `<strong>URL:</strong> ${input.url}<br>`;
            if (input.items && input.items.length > 0) {
                contentPreview += '<strong>Items:</strong><ul>';
                input.items.forEach(item => {
                    contentPreview += `<li>${item.title}: ${item.description}</li>`;
                });
                contentPreview += '</ul>';
            }
        } else if (input.type === 'file') {
            contentPreview = `<strong>File:</strong> ${input.name}<br>`;
            if (input.content) {
                const preview = input.content.length > 200 ? input.content.substring(0, 200) + '...' : input.content;
                contentPreview += `<strong>Content:</strong><pre>${preview}</pre>`;
            }
        }
        
        inputElement.innerHTML = `
            <h4>${getInputTypeLabel(input.type)}</h4>
            <div class="input-content">${contentPreview}</div>
            <div class="input-meta">Added: ${date}</div>
        `;
        
        inputsList.appendChild(inputElement);
    });
}

function getInputTypeLabel(type) {
    switch (type) {
        case 'web_search': return 'Web Search';
        case 'rss_feed': return 'RSS Feed';
        case 'file': return 'File Upload';
        default: return 'Input';
    }
}

function updateOutputsList(outputs) {
    const outputsList = document.getElementById('outputs-list');
    if (!outputsList) return;
    
    if (!outputs || outputs.length === 0) {
        outputsList.innerHTML = '<p>No outputs saved yet.</p>';
        return;
    }
    
    outputsList.innerHTML = '';
    outputs.forEach(output => {
        const outputElement = document.createElement('div');
        outputElement.className = 'output-item';
        
        // Format date
        const date = output.timestamp ? formatDate(new Date(output.timestamp * 1000)) : 'Unknown';
        
        // Truncate content for preview
        const contentPreview = output.content.length > 200 ? output.content.substring(0, 200) + '...' : output.content;
        
        outputElement.innerHTML = `
            <h4>${output.file_name}</h4>
            <div class="output-preview">
                <pre>${contentPreview}</pre>
            </div>
            <div class="output-meta">
                <span>Created: ${date}</span>
                <button class="btn btn-small view-output-btn">View Full</button>
                <button class="btn btn-small edit-output-btn">Edit</button>
            </div>
        `;
        
        outputsList.appendChild(outputElement);
    });
    
    // Add event listeners to output buttons
    document.querySelectorAll('.view-output-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            // Fill the output form with the selected output's content for viewing
            if (outputs[index]) {
                document.getElementById('output-content').value = outputs[index].content;
                document.getElementById('output-name').value = outputs[index].file_name;
                
                // Focus on the content area
                document.getElementById('output-content').focus();
            }
        });
    });
    
    document.querySelectorAll('.edit-output-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            // Fill the output form with the selected output's content for editing
            if (outputs[index]) {
                document.getElementById('output-content').value = outputs[index].content;
                document.getElementById('output-name').value = outputs[index].file_name;
                
                // Focus on the content area and set cursor at the end
                const contentArea = document.getElementById('output-content');
                contentArea.focus();
                contentArea.setSelectionRange(contentArea.value.length, contentArea.value.length);
            }
        });
    });
}

async function openDocument(docId, documents, fetchData) {
    try {
        // Find the document in the list
        const doc = documents.find(d => d.id === docId);
        
        if (!doc) {
            throw new Error('Document not found');
        }
        
        // Store the document in state
        appState.currentJob = doc;
        
        // Navigate to document view
        navigateToView('document');
        
        // Update document info
        updateDocumentInfo(doc);
        
        showNotification('Document loaded', 'success');
    } catch (error) {
        showError('Error opening document', error);
    }
}

export { initializeEventHandlersWithApi, updateDocumentsList, updateDocumentInfo, addMessageToConversation, removeMessage, updateInputsList, updateOutputsList };