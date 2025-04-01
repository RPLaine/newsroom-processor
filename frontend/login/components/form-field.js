export function createFormField(type, id, label, placeholder = '', autocomplete = '') {
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'form-group';
    
    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.textContent = label;
    
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.name = id;
    input.placeholder = placeholder;
    input.required = true;
    
    if (autocomplete) {
        input.autocomplete = autocomplete;
    }
    
    fieldContainer.appendChild(labelElement);
    fieldContainer.appendChild(input);
    
    return fieldContainer;
}