/* mongodb model for user profile(contain only non-gameplay and non-critical informations) */

const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    countryname: {
        type: String,
        required: true
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

const profile = mongoose.model("Profile", ProfileSchema);

module.exports = { profile };