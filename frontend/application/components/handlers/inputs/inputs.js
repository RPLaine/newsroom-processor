import { formatDate } from '../../common.js';

export function updateInputsList(inputs) {
    const inputsList = document.getElementById('inputs-list');
    if (!inputsList) return;
    
    if (!inputs || inputs.length === 0) {
        inputsList.innerHTML = '<p class="empty-state">No tools have been used. Please use one of the tools above to add content to your project.</p>';
        return;
    }
    
    inputsList.innerHTML = '';
    
    inputs.forEach(input => {
        const inputElement = document.createElement('div');
        inputElement.className = 'input-item';
        
        const date = input.timestamp ? formatDate(new Date(input.timestamp * 1000)) : 'Unknown';
        
        let contentPreview = '';
        
        if (input.type === 'web_search') {
            contentPreview = `<strong>Query:</strong> ${input.query || 'Unknown'}<br>`;
            if (input.results && input.results.length > 0) {
                contentPreview += `<strong>Results:</strong><br>`;
                input.results.forEach(result => {
                    contentPreview += `• ${result.title || 'Unknown'}<br>`;
                });
            }
        } else if (input.type === 'rss_feed') {
            contentPreview = `<strong>Source:</strong> ${input.url || 'Unknown'}<br>`;
            if (input.items && input.items.length > 0) {
                contentPreview += `<strong>Items:</strong><br>`;
                input.items.forEach(item => {
                    contentPreview += `• ${item.title || 'Unknown'}<br>`;
                });
            }
        } else if (input.type === 'file') {
            contentPreview = `<strong>File:</strong> ${input.name || 'Unknown'}<br>`;
            const contentSample = input.content ? input.content.substring(0, 100) + '...' : 'No content';
            contentPreview += `<strong>Preview:</strong> ${contentSample}`;
        }
        
        inputElement.innerHTML = `
            <h3>${getInputTypeLabel(input.type)}</h3>
            <div class="input-content">${contentPreview}</div>
            <div class="input-meta">Added: ${date}</div>
        `;
        
        inputsList.appendChild(inputElement);
    });
}

export function getInputTypeLabel(type) {
    switch (type) {
        case 'web_search': return 'Web Search';
        case 'rss_feed': return 'RSS Feed';
        case 'file': return 'File Upload';
        default: return 'Input';
    }
}