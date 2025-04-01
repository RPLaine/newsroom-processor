// Application state
const appState = {
    isInitialized: false,
    currentUser: null,
    currentView: 'dashboard',
    availableViews: ['dashboard', 'create', 'stories', 'settings', 'story'],
    sessionStartTime: null
};

export default appState;