const mongoose = require('mongoose');

const UserIconSchema = mongooseSchema({
    image_id: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    last_modified: {
        type: String,
        required: true
    },
    last_modified_by: {
        type: String,
        required: true
    }
});

const UserIcon = mongoose.model('UserIcon', UserIconSchema);

modules.exports = { UserIcon };