/**
 * Creates a form input field group with label and input element
 * 
 * @param {string} id - Input element ID
 * @param {string} labelText - Text for the label
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {boolean} required - Whether the field is required
 * @param {string} autocomplete - Value for the autocomplete attribute (optional)
 * @returns {HTMLElement} The form group element
 */
export function createFormField(id, labelText, type = 'text', required = true, autocomplete = null) {
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
    
    // Set autocomplete attribute
    if (autocomplete) {
        // 1. Use explicitly provided value if available
        input.autocomplete = autocomplete;
    } else if (type === 'password') {
        // 2. Handle password fields
        input.autocomplete = id.includes('new') || id.includes('register') || 
                            id.includes('signup') || id.includes('confirm') ? 
                            'new-password' : 'current-password';
    } else if (type === 'email' || (type === 'text' && /user(name|-name)?/i.test(id))) {
        // 3. Handle email fields and username text fields
        input.autocomplete = 'username';
    }
    
    formGroup.appendChild(input);
    
    return formGroup;
}