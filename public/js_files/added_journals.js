 const back_to_dashboard_button = document.getElementById("back_to_dashboard_button");
 const journal_vault = document.getElementById("journal_vault"); // Div where all journals are stored...
 
 // Back to dashboard button...
 back_to_dashboard_button.addEventListener("click", () =>{
    back_to_dashboard_button.disabled = true; // Disable the button on click...
    window.location.href = "/dashboard"; // Send to dashboard route...

    back_to_dashboard_button.disabled = false; // Enable the button now...
    return;
 });


 // Function to enable fetch of journals from server...
 const fetch_journals_from_server = async () =>{
    try{
        const fetch_data = await fetch("/get_personal_journals", {
            method: "GET",
            credentials: "include" // Pass the cookie upon request...

        });

        // If the response is not okay...
        if(!fetch_data.ok){
            const error_message = await fetch_data.json(); // Await data received in json format...
            console.log(error_message.error);
            return; // Exit given function then

        }

        // Otherwise if the response is fine... then 
        const data_retrieved = await fetch_data.json(); // Await the data received upon successful written request..
        const journals_found = data_retrieved.retrieved_journals; // Array of the journals found...
        const number_of_journals = journals_found.length; // Get the number of journals since it's an array of objects man you know

        // If user has no journals...
        if(number_of_journals === 0){
            const no_journals_msg = "Opps your journal vault is empty...";
            console.log(no_journals_msg);
            
            // Create a p element and insert inside the div
            const p_elem = document.createElement("p");
            p_elem.textContent = no_journals_msg;
            p_elem.style.padding = "10px"; // Add some 10px to the padding...
            //p_elem.style.backgroundColor = "#f0f4f8" // Some winter haze
            p_elem.style.width = "300px"
            p_elem.style.borderRadius = "4px";
            p_elem.style.fontWeight = "bold";
            journal_vault.appendChild(p_elem); // Append the p element inside the div
            
            return; // Abort function 

        }

        // If user journals exist in database...
        else{
            journals_found.forEach((journal_found) =>{
                // Create a div to store the journal like a card...
                const journal_card = document.createElement("div"); // Main holder...
                const journal_p_elem = document.createElement("p"); // To store the journal content standalone...
                const time_stamp = document.createElement("small"); // To hold the timestamps

                journal_p_elem.textContent = journal_found.journal; // Insert the journal as a p element
                journal_p_elem.style.margin = "0px"; // Reset the margin on the p elem
                journal_p_elem.style.fontWeight = "bold"; // Make bold
                
                journal_card.style.border = "1px solid #ccc"; // Some border grey
                journal_card.style.borderRadius = "4px"; // Rounded corners
                journal_card.style.padding = "15px"; // Padding on each style
                journal_card.style.marginBottom = "10px"; // Margin bottom below each card
                journal_card.style.backgroundColor = "#fff"; // White color on journals

                const time_created = new Date(journal_found.created_at).toLocaleString(); // Convert to readable time...
                time_stamp.textContent = `Posted on ${time_created}`; // Add the text Content
                time_stamp.style.display = "block";
                time_stamp.style.marginTop = "8px";
                time_stamp.style.color = "gray";
                

                journal_card.appendChild(journal_p_elem); // Append inside the div elem
                journal_card.appendChild(time_stamp); // Add timestamp
                journal_vault.appendChild(journal_card); // Add to main journal vault



            });
        }


    }
    catch(error){
        console.log("Error occured fetching data from the server!");
        return;
    }
 } 

fetch_journals_from_server(); // Invoke fetch journals function...