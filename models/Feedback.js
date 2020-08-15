/* Feedback model */

const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);

module.exports = { Feedback };