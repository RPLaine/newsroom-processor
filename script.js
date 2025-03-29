// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the button element
    const testButton = document.getElementById('test-button');
    const result = document.getElementById('result');
    
    // Add click event listener to the button
    testButton.addEventListener('click', function() {
        // Change the result text
        result.textContent = 'JavaScript is working correctly!';
        
        // Add a simple animation effect
        result.style.color = '#4b6584';
        setTimeout(() => {
            result.style.color = '#333';
        }, 1500);
    });
    
    // Display the current date and time
    const now = new Date();
    const dateTimeString = now.toLocaleString();
    
    // Append the current time to the result
    const timeElement = document.createElement('p');
    timeElement.textContent = `Page loaded at: ${dateTimeString}`;
    document.querySelector('main').appendChild(timeElement);
});