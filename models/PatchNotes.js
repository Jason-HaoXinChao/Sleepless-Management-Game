/* Patch note model */

const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
})

const PatchnoteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    notes: {
        type: [NoteSchema],
        required: false,
        default: []
    }
});

const PatchNote = mongoose.model("PatchNote", PatchnoteSchema);

module.exports = { PatchNote };