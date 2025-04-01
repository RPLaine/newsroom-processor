import { createLoginContainer } from './components/login-container.js';
import { setupFormHandlers } from './components/form-handlers.js';

async function createLogin(data, appContainer, FetchData) {
    appContainer.innerHTML = '';
    appContainer.appendChild(createLoginContainer());
    
    setupFormHandlers(FetchData);
    
    return data;
}

export default {
    createLogin
};