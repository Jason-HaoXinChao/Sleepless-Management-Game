/* Diplomacy model */

const mongoose = require("mongoose");

const DiplomacySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    connection: {
        type: [String],
        required: false,
        default: [],
        unique: false,
        trim: true
    }
});

DiplomacySchema.statics.findByUsername = async function(username) {
    const Diplomacy = this;

    try {
        const diplomacy = await Diplomacy.findOne({ username: username });
        if (!diplomacy) {
            return false;
        } else {
            return diplomacy;
        };
    } catch (err) {
        console.log(err);
    }
};

const Diplomacy = mongoose.model("Diplomacy", DiplomacySchema);

module.exports = { Diplomacy };