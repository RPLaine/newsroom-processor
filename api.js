// Import the action processor
const { processAction } = require('./actions');

// Function to send actions to the backend
async function sendAction(actionName, data = {}) {
  try {
    // Process the action using our action handler system
    const result = await processAction(actionName, data);
    return result;
  } catch (error) {
    console.error(`Error in sendAction for '${actionName}':`, error);
    throw error;
  }
}