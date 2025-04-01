export function createFormField(type, id, label, placeholder = '') {
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'form-field';
    
    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.textContent = label;
    
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.name = id;
    input.placeholder = placeholder;
    input.required = true;
    
    fieldContainer.appendChild(labelElement);
    fieldContainer.appendChild(input);
    
    return fieldContainer;
}