const express = require("express");
const path = require("path");
const app = express();
const mongo_db = require("mongoose"); // Import mongoose to connect to MongoDB driver
const bcrypt = require("bcrypt"); // Import bcrypt to hash passwords

const PORT = 3400;
const connection_string = "mongodb+srv://zfronk:h2YIJKjj1CegB1DF@cluster-one.gncpcic.mongodb.net/safe_zone?retryWrites=true&w=majority&appName=cluster-one"; // MongoDB connection string!


// Create a users schema for mongoDB
// users collection should have username, email, password and created_at fields!
const user_schema = new mongo_db.Schema({
    username:{
        type: String,
        required: true,
        trim: true // Remove any leading trails or spaces!
    },
    email:{
        type: String,
        required: true,
        trim: true, // Remove any leading trails and spaces!
        unique: true // Email must be unique at all times!
    },
    password:{
        type: String,
        required: true,
        trim: true // Remove all whitespace from the password!
    },
    created_at:{
        type: Date,
        default: Date.now // Set the default value to current date and time!      
    }


});

// Create the collection in the safe_zone database
const User = mongo_db.model("users", user_schema, "users"); // Create a model for the users collection

// For each request check frm the public folder
app.use(express.json()); // Receive JSON data from client
app.use(express.static(path.join(__dirname, "..", "public")));

// Get request from the client! // ".." to enhacne back directory...
app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, "..","public", "register.html"));

});

// Lets send the resistration page to the user
app.get("/register", (req, res) =>{
    res.sendFile(path.join(__dirname, "..", "public", "register.html")); // Send the html registartion page to the user
});

// Route to register user data!
app.post("/register_user", async (req, res) =>{
    try{
        const user_data = req.body; // Get user data in json format!
        
        // If any fields is empty...
        if(!user_data.username || !user_data.email || !user_data.password){
            // If any of the fields are empty!
            return res.status(400).json({
                error_message: "Please fill all the fields!"
            });

        }

        // Check if email contains "@" and "." characters
        if(!user_data.email.includes("@") || !user_data.email.includes(".")){
            return res.status(400).json({
                error_message: "Please enter a valid email address!"
            });
            

        }

        // If the password is less than 12 characters
        if(user_data.password.length < 12 ){
            return res.status(400).json({
                error_message: "Password must be at least 12 characters long!"
            });

        }

        // Check from the db via email if user already exists!
        const existing_user = await User.findOne({
            email: user_data.email // Find user via email!
        });

        // If true the user already exists!
        if(existing_user){
            return res.status(400).json({
                error_message: "Email already exists! Please try another email!"
            });

        }

        // Hash password before saving to the database
        const generated_salt = await bcrypt.genSalt(10); // 10 rounds of salt! 
        const hashed_password = await bcrypt.hash(user_data.password, generated_salt); // Hash the password with the generated salt

        // Reformat the user data before saving to the database
        const formated_user_data = {
            username: user_data.username,
            email: user_data.email,
            password: hashed_password // Save the hashed password to the database!
        }

        // Save the new formatted user data to database
        const new_user = new User(formated_user_data); 
        await new_user.save(); // Save the new user to database

        // Else if fields are filled!
        return res.status(200).json({
            success_message: "Registration successful!",
            user_data:{
                username: new_user.username
            }
        });

    }   
    catch(error){
        res.status(500).json({
            error_message: "Internal server error! Please try again later.",
            details: error.message
        });

    } 


});

// Let's send out the login page to the user
app.get("/login", (req, res) =>{
    res.sendFile(path.join(__dirname, "..", "public", "login.html")); // Send the html login page to the user
    
});;

// For any invalid request send to 404 page
app.use((req, res) =>{
    res.status(404).sendFile(path.join(__dirname, "..", "public", "404.html"));
});


// Start the server and when server starts wait for the db connection first!
const start_server = async () =>{
    try{
        console.log("Connecting to database..."); // Log before connecting to the database!
        await mongo_db.connect(connection_string); // Connect using the connection string!
        console.log("Connected to database sucessfully!");

        // Make server listen for incoming requests on the given port
        app.listen(PORT, () =>{
            console.log("Server started on port: ", PORT); // Make the server start on the given port!
        });

    }
    catch(error){
        console.log("Error while connecting to the database: ", error.message);
    }
}

start_server(); // Start the given server!