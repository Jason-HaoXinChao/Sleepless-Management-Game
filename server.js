'use strict';
const log = console.log;

// Express
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Mongo and Mongoose
const { ObjectID } = require('mongodb');
const { mongoose } = require('./db/mongoose');
mongoose.set('bufferCommands', false);
mongoose.set('useFindAndModify', false);
const { Credential } = require("./models/UserCredential");

// Default get route
app.get("/", (req, res) => {
    res.status(200).sendfile(__dirname + "/home_login.html");
});

/**
 *  Register Route
 *  Expected body:
 *  {
 *  username: <username>
 *  password: <password>
 *  email: <an email address containing @>
 *  birthday: <a string in the format YYYY-MM-DD>
 *  }
 */
app.post("/home_login.html", (req, res) => {
    const credential = new Credential({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        birthday: req.body.birthday
    });
    // Insert code here for validation

    // check mongoose connection established.
    if (mongoose.connection.readyState != 1) {
        log('Issue with mongoose connection')
        res.status(500).send('Internal server error')
        return;
    }
    credential.save().then((result) => {
        res.send(result);
    }).catch((error) => {
        res.status(400).send("Bad Request");
    });
})

const port = process.env.PORT || 5000;
app.listen(port, () => {
    log(`listening to ${port}`);
});