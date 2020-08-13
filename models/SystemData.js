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

StatChangeSchema.methods.convertToArray = function() {
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
        unique: false,
        trim: true
    },
    statChange: {
        type: StatChangeSchema,
        require: true,
        unique: false
    }
});

EstablishmentInfoSchema.statics.findByName = async function(name) {
    const Establishment = this;

    try {
        const establishment = await Establishment.findOne({ name: name });
        if (!establishment) {
            return false;
        } else {
            return establishment;
        };
    } catch (err) {
        console.log(err);
    }
}

const LogSchema = new mongoose.Schema({
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
    },
    newEstablishment: {
        type: String,
        required: false,
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



RandomEventSchema.statics.findByName = async function(name) {
    const RandomEvent = this;

    try {
        const randomEvent = await RandomEvent.findOne({ name: name });
        if (!randomEvent) {
            return false;
        } else {
            return randomEvent;
        };
    } catch (err) {
        console.log(err);
    }
}

RandomEventSchema.statics.findRandom = async function(callback) {
    // To be fixed
}


const EstablishmentInfo = mongoose.model("EstablishmentInfo", EstablishmentInfoSchema);
const EventChoice = mongoose.model("EventChoice", EventChoiceSchema);
const RandomEvent = mongoose.model("RandomEvent", RandomEventSchema);

module.exports = { EstablishmentInfo, EventChoice, RandomEvent };