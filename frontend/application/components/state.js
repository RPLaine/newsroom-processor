// Application state manager
const appState = {
    currentStructure: null,
    currentNode: null,
    activeTab: 'structures',      // 'structures', 'inputs', 'process', 'outputs'
    isProcessing: false,
    lastNotification: null
};

export default appState;