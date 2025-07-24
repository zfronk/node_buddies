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
        const journals_found = data_retrieved.retrieved_journals;
        const number_of_journals = journals_found.length; // Get the number of journals since it's an array of objects man you know

        // If user has no journals...
        if(number_of_journals === 0){
            console.log("You have no journals added!");
            
            return; // Abort function 

        }

        // If user journals exist in database...
        else{
            journals_found.forEach((journal) =>{
                console.log(journal)
            });
            
            return; // Abort function

        }



    }
    catch(error){
        console.log("Error occured fetching data from the server!");
        return;
    }
 } 

fetch_journals_from_server(); // Invoke fetch journals function...