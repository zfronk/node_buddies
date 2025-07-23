const express = require("express");
const path = require("path");
const app = express();
const mongo_db = require("mongoose"); // Import mongoose to connect to MongoDB driver
const bcrypt = require("bcrypt"); // Import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); //Get the json web token
const cookie_parser = require('cookie-parser'); // Use to read cookies request

// Will soon add to env for credentials storage
const PORT = 3400;
const connection_string = "mongodb+srv://zfronk:h2YIJKjj1CegB1DF@cluster-one.gncpcic.mongodb.net/safe_zone?retryWrites=true&w=majority&appName=cluster-one"; // MongoDB connection string!
const jwt_secret = "low_level_zfronk.C"; // Json web token secret!

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

// Journal schema to work with // journal, created_at, journal_id (Same as the users id for easy sorting...)
const journal_schema = new mongo_db.Schema({
    journal:{
        type: String,
        required: true,
        trim: true
    },
    created_at:{
        type: Date,
        default: Date.now
    },
    journal_id:{
        type: String,
        required: true
    }
});

// Create the collection in the safe_zone database
const User = mongo_db.model("users", user_schema, "users"); // Create a model for the users collection
const Journal = mongo_db.model("journals", journal_schema, "journals"); // Create a model for the journals collection

// For each request check frm the public folder
app.use(express.json()); // Receive JSON data from client
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(cookie_parser()); // Used to read cookies on request

// Get request from the client! // ".." to enhacne back directory...
app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, "..","public", "html_files/login.html"));

});

// Lets send the resistration page to the user
app.get("/register", (req, res) =>{
    res.sendFile(path.join(__dirname, "..", "public", "html_files/register.html")); // Send the html registartion page to the user
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
    res.sendFile(path.join(__dirname, "..", "public", "html_files/login.html")); // Send the html login page to the user
    
});;

// Route to login the user
app.post("/login_user", async(req, res) => {
    try{
        const login_data = req.body; // Get the login data in JSON format!
        
        // Check if any of the fields are empty! // Email or the password
        if(!login_data.email || !login_data.password){
            return res.status(400).json({
                error_message: "Please fill all the fields!" // Server check for security!
            });

        }
        
        // Check if email contains "@" and "." characters
        if(!login_data.email.includes("@") || !login_data.email.includes(".")){
            return res.status(400).json({
                error_message: "Please enter a valid email address!" // Server check for security!
            })
        }

        // If all fields are filled then find the user from the database by email
        const existing_user = await User.findOne({
            email: login_data.email 
        });

        // If it returns false then user does not exist!
        if(!existing_user){
            return res.status(400).json({
                error_message: "User does not exist! Please register first!" // User does not exist!
            });

        }

        // Else check whether the password matches using the hashed password in db
        const password_match = await bcrypt.compare(login_data.password, existing_user.password)

        // If invalid password then return status 403
        if(!password_match){
            return res.status(403).json({
                error_message: "Invalid password! Try again!" 
            });
        }

        // Now sign the json so that the user uses it on all requests
        const token_payload = {
            user_id: existing_user._id, // Pass the user id to the payload
            user_name: existing_user.username // Pass the username to the payload
        }

        // Sign the the token_payload using the secret key! using json web token package
        const jwt_main_token = jwt.sign(token_payload, jwt_secret, {
            expiresIn: "75m" // Expires in 15 minutes
        });

        // Respons with a cookie... called "token"
        res.cookie("token", jwt_main_token, {
            httpOnly: true, // Avoid client side access to the cookie
            sameSite: "Strict", // Secure and usable
            secure: true // Means only https can access the cookie
        });


        // If password matches
        return res.status(200).json({
            success_message: "Login successful!",
            user_data:{
                username: existing_user.username // Send the username to client for welcome message!
            }
        });


    }
    catch(error){
        res.status(500).json({
            error_message: "Error occured while logging in! Please try again later.",
            details: error.message // From the erro object
        });

    }
    

});

// Some protected route -- Say a dashboard
app.get("/dashboard", async (req, res) =>{
    try{
        const token = req.cookies.token; // Read the cookies object

        // If the token is not present, return an error message
        if(!token){
            // Status code 401
            res.sendFile(path.join(__dirname, "..", "public", "html_files", "401.html")); // Send the 401.html file
        }
        const decoded_payload = jwt.verify(token, jwt_secret); // Verify the token payload

        // Await to find the username via the decoded payload id!
        const existing_user = await User.findOne({
            _id: decoded_payload.user_id 
        });

        // If user not found!
        if(!existing_user){
            // Status code 401
            res.sendFile(path.join(__dirname, "..", "public", "html_files", "401.html"));

        }
        
        // If the user is found respond with the dashboard page...
        res.sendFile(path.join(__dirname, "..", "public", "html_files", "dashboard.html"));
    
    }
    catch(error){
        return res.sendFile(path.join(__dirname, "..", "public", "html_files", "401.html"));
    }
});

// Route to post journals added by user! 
app.post("/personal_journal", async (req, res) =>{
    try{
        const recieved_cookie = req.cookies.token; // Get cookie

        // If no token sent during the fetch request hit with a 401 response
        if(!recieved_cookie){
            return res.status(401).json({
                message: "You are not logged in!"
            });
        }

        // If cookie present get the request body
        const journal_object = req.body;
        
        // If either is of the data is empty respond with a json 
        if(journal_object.journal || journal_object.time_created){
            res.status(400).json({
                error_message: "Insufficient data passed by the client!"
            });

        }

        // Otherwise if the data is legitimate 
        const decoded_payload = jwt.verify(recieved_cookie, jwt_secret); // Decode the payload to get token
        const decoded_user_id = decoded_payload.user_id; // Get the user id from the payload

    }
    // Catch error...
    catch(error){
        res.status(500).json({
            details: error.message,
            error_message: "Error occured while adding personal journal!"
        });
    }

});

// An about route no need to read cookies here just display...
app.get("/about", (req, res) =>{
    res.sendFile(path.join(__dirname, "..", "public", "html_files/about.html" ));
});

// Forbidden route... 401 status
app.get("/forbidden", (req, res) =>{
    res.status(401).sendFile(path.join(__dirname, "..", "public/html_files/401.html"));
});


// For any invalid request send to 404 page
app.use((req, res) =>{
    res.status(404).sendFile(path.join(__dirname, "..", "public", "html_files/404.html"));
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