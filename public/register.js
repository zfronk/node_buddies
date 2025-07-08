const registration_form = document.getElementById("registration_form"); // The whole form element!
const error_box = document.getElementById("error_box"); // The error box element!
const register_button = document.getElementById("register_button"); // Register button!
const welcome_user = document.getElementById("welcome_user"); // Welcome  user element!

// Function to delay execution!
const delay = (time) =>{
    return new Promise((resolve) =>{
        setTimeout(() => {
            resolve(); // Resolve the promise after the delay!
        }, time); // Set the delay time!
    });
}

// An event listener for the form submission!
registration_form.addEventListener("submit", async (event) =>{
    event.preventDefault(); // Prevent default form submission!
    register_button.disabled = true; // Disable the register button on form submission!


    // Get the values from the form input!
    const user_name = document.getElementById("username").value.trim(); // Get the username and trim it!
    const email = document.getElementById("email").value.trim(); // Get the email and trim it!
    const password = document.getElementById("password").value.trim(); // Get the password and trim it!

    // Create a form data object to send to server!
    const form_data = {
        username: user_name,
        email: email,
        password: password
    }
    // Just for defense, we will check if the form data is valid!
    // Just valid befrore sending the data!
    if(!form_data || !form_data.username || !form_data.email || !form_data.password){
        const error_message =  "Please fill all the fields!";
        error_box.innerText = error_message;
        error_box.style.color = "red"; // Show error in red color!

        // Wait for 2 seconds then clear the error box message!
        setTimeout(() =>{
            error_box.innerText = ""; // Clear the innerText
            register_button.disabled = false; // Enable the register button again!
        }, 2000); // Clear after some two seconds!
        return;

    }

    // Send positive UI feedback to the user!
    error_box.innerText = "Sending data to server please wait...";
    error_box.style.color = "blue"; // Show in blue color!
    
    await delay(2000); // Wait for 2 seconds to simulate sending data to server!
    error_box.textContent = ""; // Clear the sending data to server message!

    // Call the backend api to register user
    const talk_to_server = async () =>{
        try{
            // Send POST request to the server...
            const fetch_response = await fetch("/register_user", {
                method: "POST", // Post to add data to server!
                headers:{
                    "Content-Type" : "application/json" // Server expects JSON format!
                },
                body: JSON.stringify(form_data) // Convert form data to JSON string before sending!

            });

            // If response is ok
            if(fetch_response.ok){
                const response_data = await fetch_response.json(); // Get the response data in JSON format of the response is ok
                console.log("Response from server:", response_data);
                
                await delay(2000); // Wait for 2 seconds before showing the success message!
                const success_message = response_data.success_message || "Registration successful!"; // Get the success message from the response data
                error_box.textContent = success_message; // Show the success message in the error box
                error_box.style.color = "green"; // Show success message in green color!
                
                await delay(2000); // Wait for 2 seconds before clearing the message!
                error_box.textContent = ""; // Clear the success message!
                // Clear all form inputs
                registration_form.reset();
                register_button.disabled = false; // Enable the register button again!

                welcome_user.textContent = `Welcome ${response_data.user_data.username}`; // Show welcome message to the user!
                welcome_user.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.5)"; // Add some shadow to the text!
            }
            
            // If response is not ok
            else{  
                const error_data = await fetch_response.json(); // Get the error data JSON format
                error_box.textContent = error_data.error_message; // Show the error message in the error box
                error_box.style.color = "red"; // Show error in red color!
                register_button.disabled = false; // Enable the register button again!
                return; // Just so user starts again!

            }
            

        }
        catch(error){
            error_box.textContent = error.message + ", server is not responding!";
            error_box.style.color = "red"; // Show error in red color!
            register_button.disabled = false; // Enable the register button again!
            return;

        }

    }

    await talk_to_server(); // Call the function to talk to server!

});