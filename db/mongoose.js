'use strict';

const mongoose = require('mongoose');
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://team32:team32@team32.udppt.mongodb.net/game?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).catch((err) => {
    console.log('Error connecting to mongodb. Timeout reached.');
});

module.exports = { mongoose };