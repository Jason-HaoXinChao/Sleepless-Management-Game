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
const { Restaurant } = require('./models/restaurant');

// Default get route
app.get("/", (req, res) => {
    res.status(200).sendfile(__dirname + "/home_login.html");
});