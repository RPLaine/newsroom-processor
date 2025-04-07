// Function to create a collapsible section in the workflow area
export function collapsibleSection(heading, content) {
    // content check
    if (typeof content === 'object') {
        // Format object content as structured HTML instead of plain JSON
        let formattedContent = '<div class="structure-data-content">';
        
        // Helper function to handle nested objects recursively
        function formatObjectRecursively(obj, indent = 0) {
            let result = '';
            const padding = indent > 0 ? `padding-left: ${indent * 15}px;` : '';
            
            for (const [key, value] of Object.entries(obj)) {
                if (value === null) {
                    result += `<div style="${padding}"><strong>${key}:</strong> null</div>`;
                } else if (typeof value === 'object') {
                    result += `<div style="${padding}"><strong>${key}:</strong></div>`;
                    result += formatObjectRecursively(value, indent + 1);
                } else {
                    result += `<div style="${padding}"><strong>${key}:</strong> ${value}</div>`;
                }
            }
            
            return result;
        }
        
        formattedContent += formatObjectRecursively(content);
        formattedContent += '</div>';
        content = formattedContent;
    } else if (typeof content !== 'string') {
        content = String(content);
    }

    // get the workflow container element
    const workflowContainer = document.getElementById('workflow-container');

    // First, collapse all existing sections
    const existingSections = workflowContainer.querySelectorAll('.collapsible-section');
    existingSections.forEach(section => {
        const contentElement = section.querySelector('.collapsible-content');
        const toggleIcon = section.querySelector('.toggle-icon');
        
        if (contentElement && !contentElement.classList.contains('collapsed')) {
            contentElement.classList.add('collapsed');
            if (toggleIcon) toggleIcon.innerHTML = '▶';
        }
    });

    // create a collapsible section with the standard class name
    const sectionCollapsible = document.createElement('div');
    sectionCollapsible.className = 'collapsible-section';

    // create the heading
    const headingElement = document.createElement('h4');
    headingElement.className = 'collapsible-heading';
    headingElement.innerHTML = heading;

    // create the toggle icon - expanded for the new section
    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'toggle-icon';
    toggleIcon.innerHTML = '▼';  // Down arrow for expanded state

    // create the content - not collapsed for the new section
    const contentElement = document.createElement('div');
    contentElement.className = 'collapsible-content'; // No 'collapsed' class
    contentElement.innerHTML = content;

    // add the toggle icon to the heading
    headingElement.appendChild(toggleIcon);

    // append the heading and content to the section collapsible
    sectionCollapsible.appendChild(headingElement);
    sectionCollapsible.appendChild(contentElement);

    // append the section collapsible to the workflow container
    workflowContainer.appendChild(sectionCollapsible);
    
    // Scroll to the newly added section
    sectionCollapsible.scrollIntoView({ behavior: 'smooth', block: 'end' });
    
    return sectionCollapsible;
}

// Urefined:

export function createJobElement(job) {
    const jobElement = document.createElement('div');
    jobElement.className = 'collapsible-section';
    
    const heading = document.createElement('h4');
    heading.className = 'collapsible-heading';
    heading.innerHTML = `${job.name || job.id} <span class="toggle-icon">▶</span>`;
    
    const content = document.createElement('div');
    content.className = 'collapsible-content collapsed';
    
    // Format job data in a structured way like other sections
    let jobContent = '<div class="structure-data-content">';
    jobContent += `<div><strong>Status:</strong> ${job.status}</div>`;
    jobContent += `<div><strong>Start Time:</strong> ${job.start_time}</div>`;
    jobContent += `<div><strong>End Time:</strong> ${job.end_time}</div>`;
    jobContent += `<div><strong>Output:</strong> ${job.output || 'No output'}</div>`;
    jobContent += '</div>';
    
    content.innerHTML = jobContent;
    
    jobElement.appendChild(heading);
    jobElement.appendChild(content);
    
    return jobElement;
}