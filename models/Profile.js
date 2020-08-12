/* mongodb model for user profile(contain only non-gameplay and non-critical informations) */

const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    countryname: {
        type: String,
        required: true,
        unique: true
    },
    profilePic: {
        type: String,
        required: false
    },
    flagPic: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: false
    },
    country: {
        type: Number,
        required: false
    },
    gender: {
        type: String,
        required: false
    },
    socialMedia: {
        type: [String],
        required: false
    }
});

// Static method for finding a user's profile based on their username
ProfileSchema.statics.findByUsername = async function(username, password) {
    const UserProfile = this;

    try {
        // Attempt to find the user by their username
        const user = await UserProfile.findOne({ username: username });

        // If the user cannot be found, simply return a rejected promise
        if (!user) {
            return false;
        } else {
            return user;
        }
    } catch (err) {
        console.log(err);
    }
}

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = { Profile };