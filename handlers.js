// Import the sendAction function
const { sendAction } = require('./api');

async function loadJobs() {
  try {
    const response = await sendAction("getJobs");
    const jobsContainer = document.getElementById("jobs-container");
    
    if (response && response.jobs) {
      // Display jobs
      jobsContainer.innerHTML = "";
      response.jobs.forEach(job => {
        // Create job element and append to container
        const jobElement = createJobElement(job);
        jobsContainer.appendChild(jobElement);
      });
    } else {
      showError("No jobs data received");
    }
  } catch (error) {
    showError("Error loading jobs", error);
  }
}