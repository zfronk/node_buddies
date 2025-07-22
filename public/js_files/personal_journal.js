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

    // Talk to server and talk
    const talk_to_server = async () =>{
       try{
            const fetch_response = await fetch("/personal_journal", {
                method: "POST",
                credentials: "include",
                headers:{
                    "Content-Type": "application/json"
                },
                body:JSON.stringify(journal_object)
            });
            
            // If fetch response is not okay!
            if(!fetch_response.ok){
                const response = await fetch_response.json();
                console.log(response.error_message);


            }

       }
       catch(error){

       }

        
    }

    talk_to_server();
    
    /*
    // LOGIC TO CREATE DATE ON UI
    // Else if there is data it should post...
    const formatted_added_journal = `- "${journal_object.journal}"`;
    const date_object = new Date(journal_object.time_created); //  New data object with inbuilt methods

    // Hardcorded array data...
    const days_of_week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months_of_year = ["Jan", "Feb", 'Mar', "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct",  "Nov", "Dec"];


    const month = months_of_year[date_object.getMonth()]; // Get the month
    const date = date_object.getDate(); // Get the date of the given month
    const year = date_object.getFullYear(); // Get the given year...
    const hours = date_object.getHours(); // Get the given hours
    const minutes = date_object.getMinutes().toString().padStart(2, 0); // Get the given minutes, pad start make sure it's of 2 chars
    
    // Parse the 24 hour clock system...
    // If hours above 12 meaning it's pm
    let formated_hours; // To format the hours received
    let time_line; // Either store AM or PM

    // Meaning it's pm...
    if(hours > 12){
        formated_hours = hours - 12;
        formated_hours.toString().padStart(2, 0);

        time_line = "PM";

    }

    // If below 12 meaning it's AM
    else if(hours < 12){
        formated_hours = hours;
        formated_hours.toString().padStart(2, 0);

        time_line = "AM";

    }
    // if equal to 12 sharp means it's pm
    else if(hours === 12){
        formated_hours = hours; //Make it 12 pm
        formated_hours.date.toString().padStart(2, 0); // Ensure it takes two indexes and if null add a zero before

        time_line = "PM";
    } 

    // If 00 meaning midnight
    else if(hours === 0){
        formated_hours = hours + 12; // Means that 00 becomes 12 am now...
        formated_hours.toString().padStart(2, 0);

        time_line = "AM";
    }

    const time_stamp = `Posted on ${month} ${date}, ${year} at ${formated_hours}:${minutes} ${time_line} `;

    await await_execution(2000); // Delay execution before updating UI
    personal_journal_error.textContent = "Journal updated successfully!";
    personal_journal_error.style.fontSize = "16px";
    personal_journal_error.style.color = "green";

    await await_execution(2000); // Delay again before clearing UI adn enabling button

    personal_journal_error.textContent = "";
    journal_form.reset(); // Reset the whole form

    // New p element to hold the added journal
    const new_paragraph_element = document.createElement("p");
    new_paragraph_element.textContent = formatted_added_journal;

    const new_small_elem = document.createElement("small");
    new_small_elem.textContent = time_stamp; // Add time stamp to the html

    journal_vault.appendChild(new_paragraph_element); // Append to the journal vault
    journal_vault.appendChild(new_small_elem);
    add_journal_button.disabled = false; // Enable the button
    */
    

});
