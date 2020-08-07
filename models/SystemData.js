const mongoose = require("mongoose");

const StatChangeSchema = new mongoose.Schema({
    economy: {
        type: Number,
        required: false,
        default: 0,
    },
    order: {
        type: Number,
        required: false,
        default: 0
    },
    health: {
        type: Number,
        required: false,
        default: 0
    },
    diplomacy: {
        type: Number,
        required: false,
        default: 0
    }
});

const EstablishmentInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true

    },
    description: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    statChange: {
        type: statChangeSchema,
        require: true,
        unique: false
    }
});

const LogSchema = new mongoose.Schema({
    time: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    statChange: {
        type: StatChangeSchema,
        required: true
    }
});

const EventChoiceSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    statChange: {
        type: StatChangeSchema,
        required: true
    },
    log: {
        type: LogSchema,
        required: true,
        unique: false,
        trim: true
    }
});


const RandomEventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true

    },
    description: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    choiceOne: {
        type: EventChoiceSchema,
        required: true
    },
    choiceTwo: {
        type: EventChoiceSchema,
        required: true
    }
});

const EstablishmentInfo = mongoose.model("EstablishmentInfo", EstablishmentInfoSchema);

const RandomEvent = mongoose.model("RandomEvent", RandomEventSchema);

module.exports = { EstablishmentInfo, RandomEvent };