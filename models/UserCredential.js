/* user credential models */
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");

const CredentialSchema = new mongoose.Schema({
    username: String,
    password: Number,
    email: String
});

// A mongoose middleware to hash password before saving it into the database
CredentialSchema.pre('save', function(next) {
    const credential = this; // binds this to User document instance

    // checks to ensure we don't hash password more than once
    if (credential.isModified('password')) {
        // generate salt and hash the password
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(credential.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
})

const Credential = mongoose.model("Credential", CredentialSchema);

module.exports = { Credential };