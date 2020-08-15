const mongoose = require('mongoose');

const UserIconSchema = new mongoose.Schema({
    image_id: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    format: {
        type: String,
        required: true
    },
    uploader: {
        type: String,
        required: true
    },
    created_at: {
        type: String,
        required: true
    }
});

const UserFlagSchema = new mongoose.Schema({
    image_id: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    uploader: {
        type: String,
        required: true
    }
});

UserIconSchema.statics.findByUsername = async function(username) {
    const UserIcon = this;

    try {
        // Attempt to find the user by their username
        const userIcon = await UserIcon.findOne({ uploader: username });

        if (!userIcon) {
            return false;
        } else {
            return userIcon;
        }
    } catch (err) {
        console.log(err);
    }
}

UserFlagSchema.statics.findByUsername = async function(username) {
    const UserFlag = this;

    try {
        // Attempt to find the user by their username
        const userFlag = await UserFlag.findOne({ uploader: username });

        if (!userFlag) {
            return false;
        } else {
            return userFlag;
        }
    } catch (err) {
        console.log(err);
    }
}

const UserIcon = mongoose.model('UserIcon', UserIconSchema);
const UserFlag = mongoose.model('UserFlag', UserFlagSchema);

module.exports = { UserIcon, UserFlag };