// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the button element
    const testButton = document.getElementById('test-button');
    const result = document.getElementById('result');
    const logoutButton = document.getElementById('logout-button');
    const userEmail = document.getElementById('user-email');
    
    // Add click event listener to the test button
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
    
    // Add logout functionality
    logoutButton.addEventListener('click', function() {
        logoutUser();
    });
    
    // Function to handle logout
    function logoutUser() {
        fetch('/api/logout')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Redirect to login page
                    window.location.href = data.redirect;
                } else {
                    alert('Error logging out: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Logout error:', error);
                alert('An error occurred while logging out.');
            });
    }
    
    // Function to check authentication and get user info
    function checkAuthentication() {
        fetch('/api/check-auth')
            .then(response => response.json())
            .then(data => {
                if (data.authenticated) {
                    // Display user information
                    userEmail.textContent = data.user_id;
                } else {
                    // If not authenticated, redirect to login page
                    window.location.href = '/login/login.html';
                }
            })
            .catch(error => {
                console.error('Auth check error:', error);
                // On error, redirect to login as a fallback
                window.location.href = '/login/login.html';
            });
    }
    
    // Run auth check on page load
    checkAuthentication();
});