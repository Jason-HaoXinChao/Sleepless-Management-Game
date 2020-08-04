/* user credential models */
const mongoose = require("mongoose");

const credentialSchema = new mongoose.Schema({
    username: String,
    password: Number,
    email: String
});

const Credential = mongoose.model("Credential", credentialSchema);

module.exports = { Credential };