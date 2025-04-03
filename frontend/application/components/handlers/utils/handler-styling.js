// Function to create a collapsible section in the workflow area
export function collapsibleSection(heading, content) {
    // content check
    if (typeof content === 'object') {
        // Format object content as structured HTML instead of plain JSON
        let formattedContent = '<div class="structure-data-content">';
        for (const [key, value] of Object.entries(content)) {
            formattedContent += `<div><strong>${key}:</strong> ${value}</div>`;
        }
        formattedContent += '</div>';
        content = formattedContent;
    } else if (typeof content !== 'string') {
        content = String(content);
    }

    // get the workflow container element
    const workflowContainer = document.getElementById('workflow-container');

    // create a collapsible section with the standard class name
    const sectionCollapsible = document.createElement('div');
    sectionCollapsible.className = 'collapsible-section';

    // create the heading
    const headingElement = document.createElement('h4');
    headingElement.className = 'collapsible-heading';
    headingElement.innerHTML = heading;

    // create the toggle icon
    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'toggle-icon';
    toggleIcon.innerHTML = '►';

    // create the content
    const contentElement = document.createElement('div');
    contentElement.className = 'collapsible-content collapsed';
    contentElement.innerHTML = content;

    // add the toggle icon to the heading
    headingElement.appendChild(toggleIcon);

    // append the heading and content to the section collapsible
    sectionCollapsible.appendChild(headingElement);
    sectionCollapsible.appendChild(contentElement);

    // append the section collapsible to the workflow container
    workflowContainer.appendChild(sectionCollapsible);
    
    return sectionCollapsible;
}