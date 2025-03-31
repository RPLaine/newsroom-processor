import AppContainer from './app-container/app-container.js';
import App from './app/app.js';
import Login from './login/login.js';
import { FetchData } from './utils.js';

document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    const appContainer = AppContainer.createAppContainer();

    const request_data = {
        action: 'application_init'
    };

    let data = await FetchData(request_data);

    if (data.userid == undefined) {
        data = await Login.createLogin(data, appContainer, FetchData);
    } else {
        data = await App.createApp(data, appContainer, FetchData);
    }
}