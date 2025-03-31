/**
 * Creates a form input field group with label and input element
 * 
 * @param {string} id - Input element ID
 * @param {string} labelText - Text for the label
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {boolean} required - Whether the field is required
 * @returns {HTMLElement} The form group element
 */
export function createFormField(id, labelText, type = 'text', required = true) {
    // Create form group container
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';
    
    // Create label
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    formGroup.appendChild(label);
    
    // Create input
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.required = required;
    formGroup.appendChild(input);
    
    return formGroup;
}