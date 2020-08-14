const mongoose = require("mongoose");
const validator = require('validator');
const argon2 = require('argon2');

/* User Credential model */
const CredentialSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Usernames need to be unique
        minLength: 3,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Usernames need to be unique
        minLength: 1,
        trim: true,
        validate: {
            validator: validator.isEmail, // Uses express-validator to validate whether or not the provided string is a valid email
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
            validator: validator.isDate, // Uses express-validator to validate whether or not the provided string is a valid date (YYYY-MM-DD)
            message: 'Not a valid date'
        }
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    is_banned: {
        type: Boolean,
        default: false
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

// Static method for finding a user based on their username and password
CredentialSchema.statics.findByUsernamePassword = async function(username, password) {
    const User = this;

    try {
        // Attempt to find the user by their username
        const user = await User.findOne({ username: username });

        // If the user cannot be found, simply return a rejected promise
        if (!user) return false;
        
        // Otherwise verify whether or not the user's inputted password matches the (argon2id) hashed password stored in the database
        if (await argon2.verify(user.password, password)) {
            // If the password matches, return the user document (which will automatically be wrapped in a promise)
            return user;
        } else {
            // Otherwise, simply return a rejected promise
            return false;
        }
    } catch (err) {
        console.log(err);
    }
}

// Static method for finding a user's ban status based on their username
CredentialSchema.statics.getBanStatusByUsername = async function(username) {
    const User = this;

    try {
        // Attempt to find the user by their username
        const user = await User.findOne({ username: username });

        // If the user cannot be found, simply return a rejected promise
        if (!user) {
            return 'Not Found';
        } else {
            return user.is_banned;
        }
    } catch (err) {
        console.log(err);
    }
}

// Compile the model
const Credential = mongoose.model("Credential", CredentialSchema);

module.exports = { Credential };