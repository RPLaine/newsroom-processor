import AppContainer from './app-container/app-container.js';
import App from './app/app.js';
import Login from './login/login.js';
import { fetchData } from './utils.js';

document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    const appContainer = AppContainer.createAppContainer();

    const request_data = {
        action: 'application_init'
    };

    let data = await fetchData(request_data);

    if (data.userid == undefined) {
        data = await Login.createLogin(data, appContainer, fetchData);
    } else {
        data = await App.createApp(data, appContainer, fetchData);
    }
}