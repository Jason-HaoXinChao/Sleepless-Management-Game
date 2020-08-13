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

const UserIcon = mongoose.model('UserIcon', UserIconSchema);

module.exports = { UserIcon };