const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const {spawn} = require('child_process');


app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("<MongoDB Atlas key>", 
                {userNewUrlParser: true}, 
                {userUnifiedTopology: true}).then((db) => console.log("db is connected")).catch((err) => console.log(err));

const moodSchema = {
	content: String,
    sentiment: String
}

const Mood = mongoose.model("Mood", moodSchema);

app.get("/", function(req,res) {
	res.sendFile(__dirname + "/index.html");
})

app.post("/", function(req, res) {
    let input = req.body.user_input;
    res.redirect("/save?userInput="+input);
})

app.get("/save", function(req, res) {
    let input = req.query.userInput;
    console.log("Received input in /save: "+input);

    let prediction = new Promise((resolve, reject) => {
        let sentiment;
        const python = spawn('python3', ['script.py',input]);
        // collect data from script
        python.stdout.on('data', function (data) {
            console.log('Receiving data from Python script ...');
            sentiment = data.toString();
        });
        
        // run the following lines of code upon close event
        python.on('close', (code) => {
            console.log(`Exit child process with code ${code}`);

            if (typeof sentiment != "undefined") {
                resolve(sentiment);
            } else {
                reject("Error in prediction");
            }
        });
    });

    prediction.then((sentiment) => {
        let newMood = new Mood({
            content: input,
            sentiment: sentiment
        });

        console.log("Successful! Saving to database");
        newMood.save();

    }).catch((sentiment) => {
        console.log(sentiment);
    })

    res.redirect("/"); // need not to wait
})

app.listen(3000, () => {
	console.log("Server is running on port 3000");
})