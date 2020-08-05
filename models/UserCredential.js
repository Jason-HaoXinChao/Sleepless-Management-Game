/* user credential models */
const mongoose = require("mongoose");
const validator = require('validator');
const argon2 = require('argon2');

const CredentialSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minLength: 1,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'Not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    birthday: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: validator.isDate,
            message: 'Not a valid date'
        }
    }
});

// A mongoose middleware to hash password before saving it into the database
CredentialSchema.pre('save', async function(next) {
    const user_credentials = this; // binds this to User document instance

    // checks to ensure we don't hash password more than once
    if (user_credentials.isModified('password')) {
        try {
            const hash = await argon2.hash(user_credentials.password, { type: argon2.argon2id });
            user_credentials.password = hash;
            next();
        } catch (err) {
            console.log(err);
        }
    } else {
        next();
    }
});

CredentialSchema.statics.findByUsernamePassword = async function(username, password) {
    const User = this;

    // First, find the user by their username
    try {
        const user = await User.findOne({ username: username });

        if (!user) return;
        
        if (await argon2.verify(user.password, password)) {
            return user;
        } else {
            return;
        }
    } catch (err) {
        console.log(err);
    }

    if (!user) {
        return Promise.reject(false);
    }
}

const Credential = mongoose.model("Credential", CredentialSchema);

module.exports = { Credential };