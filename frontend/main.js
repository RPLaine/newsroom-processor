import AppContainer from './app-container/app-container.js';
import App from './app/app.js';
import Login from './login/login.js';
import { fetchData } from './utils.js';

let data = {};

document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    const appContainer = AppContainer.createAppContainer();

    const request_data = {};

    data = await fetchData(request_data);
    console.log('data', data);

    if (data.userid == undefined) {
        console.log('Login required');
        data = await Login.createLogin(data, appContainer, fetchData);
    } else {
        console.log('Login successful');
        data = await App.createApp(data, appContainer, fetchData);
    }
}