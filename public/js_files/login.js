const login_form = document.getElementById("login_form"); // Get the login form element
const error_box = document.getElementById("error_box"); // Get the error box element
const login_button = document.getElementById("login_button"); // Get the login button element
const welcome_user = document.getElementById("welcome_user"); // Get the welcome user element

// Function to delay execution
const delay_execution = (time) =>{
    return new Promise((resolve, reject) =>{
        setTimeout(() =>{
            resolve();
        }, time); // Resolve with the given time
    });
}

// Login form submission event listener
login_form.addEventListener("submit", async(event) =>{
    event.preventDefault(); // Prevent the default form submission
    // Disable button on submission
    login_button.disabled = true; 
    error_box.textContent = "Verifying your credentials..."; // Show the user that we are verifying their credentials
    error_box.style.color = "green"; // Set the error box text color to green

    await delay_execution(2000); // Two seconds wait!

    // Clear the error box
    error_box.textContent = ""; // No need to set timeout, since we already waited for seconds...

    // Get the form data
    const email_address = document.getElementById("email").value.trim(); // Get the email address and then trim the whitespace
    const password = document.getElementById("password").value.trim(); // Get the email address and then trim the whitespace

    // Check if any is null or empty!
    if(!email_address || !password){
        await delay_execution(2000); // Wait for 1 second before showing the error message
        
        error_box.textContent = "Please fill all the fields!"; // Show error message to user
        error_box.style.color = "red"; // Set the error box text color to red

        await delay_execution(2000); // Wait for 2 seconds before clearing the error box
        error_box.textContent = ""; // Clear the error box
        login_button.disabled = false; // Enable the button once again!
        return; // Exit the function
    }

    // If no field is null then
    const login_data = {
        email: email_address, // Store email address in login data object
        password: password // Store password in login data object
    }

    // Send the login data to server!
    const talk_to_server = async () =>{
        try{
            const fetch_response = await fetch("/login_user", {
                method: "POST", // Use POST method to send data
                headers: {
                    "Content-Type": "application/json" // Send data in JSON format
                },
                body: JSON.stringify(login_data) // Convert the login data object to JSON string
            });
           
            // If response ain't ok then
            if(!fetch_response.ok){
                const error_data = await fetch_response.json(); // Get the error data from the 500 code response
                error_box.textContent = error_data.error_message; // Show the error message to the user
                error_box.style.color = "red"; // Set the error box text color to red
                
                await delay_execution(2000); // Wait for 2 seconds before clearing the error box
                error_box.textContent = ""; // Clear the error box
                login_button.disabled = false; // Enable the button once again!
                return; // Exit the function
            }
            
            // If response is ok then
            else{
                const received_data = await fetch_response.json(); // Get the response data in JSON format!
                const welcome_message = received_data.success_message || "Login successful!";  // Falsify the success message if it is not present!
                error_box.textContent = welcome_message;
                error_box.style.color = "green"; // Set the error box text color to green
                
                // Display a welcome message to the user
                welcome_user.textContent = `Welcome back ${received_data.user_data.username}!`;
                welcome_user.style.fontWeight = "bolder"; // Make welcome user message bolder

                await delay_execution(2000); // Wait from 2 seconds before clearing the error box
                error_box.textContent = ""; // Clear the error box
                login_form.reset(); // Reset the form fields
                login_button.disabled = false; // Enable the button once again!
            }

        }
        catch(error){
            const error_message = error.message + ", server might be offline!"; // get the error message from the error object!
            error_box.textContent = error_message; // Show the error message to the user!
            error_box.style.color = "red"; // Set the error box text color to red

            await delay_execution(2000); // Wait for 2 seconds before clearing the error box
            error_box.textContent = ""; // Clear the error box
            login_button.disabled = false; // Enable the button once again!
            return; // Exit the talk to server function

        }
        

    }

    talk_to_server(); // Invoke the function to try the fetch request to the server!



});