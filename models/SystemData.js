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

StatChangeSchema.static.convertToArray = async function() {
    const stat = this;
    return [stat.economy, stat.order, stat.health, stat.diplomacy];
};

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

EstablishmentInfoSchema.static.findByName = async function(name) {
    const Establishment = this;

    try {
        const establishment = await Establishment.findOne({ name: name });
        if (!establishment) {
            return Promise.reject(false);
        } else {
            return establishment;
        };
    } catch (err) {
        console.log(err);
    }
}

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