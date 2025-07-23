// Lets do personal journal first...
const journal_form = document.getElementById("journal_form"); // Whole form
const journal_text_area = document.getElementById("journal_text_area"); // Where data is added!
const journal_vault = document.getElementById("journal_vault"); // Where the personal journals are added...

let add_journal_button = document.getElementById("add_journal_button"); // The add journal button
let personal_journal_error = document.getElementById("personal_journal_error"); // To show personal journal errors

// Just to hold of script excecution...
const await_execution = (duration) =>{
    return new Promise((resolve, reject) =>{
        setTimeout(() =>{
            resolve();
        }, duration);
    });
}


// Listen for the personal journal  submissions
journal_form.addEventListener("submit", async (event) =>{
    event.preventDefault(); // Prevent default submission on form
    // Disable button on click...
    add_journal_button.disabled = true;

    let added_journal = journal_text_area.value.trim(); // Get the value on form submission // Trim to remove all whitespace

    // If the area has no data on submission
    if(added_journal === ""){
        await await_execution(2000);
        personal_journal_error.textContent = "Cannot post empty journal!"
        personal_journal_error.style.fontSize = "16px";
        personal_journal_error.style.color = "red";
        await await_execution(2000);

        personal_journal_error.textContent = "";
        add_journal_button.disabled = false;
        
        return; // Exit the whole listen function
    }

    // Create a new object to store the journal data
    const journal_object = {
        journal: added_journal,
        time_created: Date.now()
    }

    // Talk to server to post the given data 
    const talk_to_server_to_post = async () =>{
       try{
            // Fetch from the api route but to post some data...
            const fetch_response = await fetch("/post_personal_journal", {
                method: "POST",
                credentials: "include",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(journal_object) // Push the journal_object to the api as a string
            });
            
            // If unathorized throw back to forbidden route
            if(fetch_response.status === 401){
                window.location.href = "/forbidden"; // Reroute to forbidden route...
                return;
            
            }

            // Response no okay
            if(!fetch_response.ok){
                personal_journal_error.style.color = "red"; // Make the response red in color
                personal_journal_error.textContent = "Error occured while fetching response"; // Display text Content
                await await_execution(2000); // 2 second delay

                personal_journal_error.textContent = "";
                add_journal_button.disabled = false; // Disable the button
                return; // Exit function

            }

            // If clean
            const greenlight_response = await fetch_response.json(); // Get the response in json
            await await_execution(2000); // Two seconds delay to submission

            personal_journal_error.textContent = greenlight_response.message; // Display message to user            
            personal_journal_error.style.color = "green"; // Display green for the status color!
            await await_execution(2000); // Delay by 2 seconds
            
            add_journal_button.disabled = false; // Enable button
            personal_journal_error.textContent = "";
            journal_form.reset(); // Reset whole form
            return;

            
        

       }
       catch(error){
            const error_message = error.message;
            personal_journal_error.style.color = "red"; // Make text color red...
            personal_journal_error.textContent = error_message + ", server might be offline...";
            await await_execution(2000); // Await some 2 seconds then clear the response
            
            personal_journal_error.textContent = ""; // Clear
            add_journal_button.disabled = false; // Enable button
            return;

       }

        
    }

    await talk_to_server_to_post(); // INVOKE TALK TO SERVER FUNCTION...

    // Talk to server to get some response and display to UI you know...
    const talk_to_server_to_get = async () =>{
        try{
            const fetch_reponse = await fetch("get_personal_journals");
        }
        catch(error){

        }
        
    }

});
