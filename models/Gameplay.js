/* User, establishment, statistics, log, strategies model */

const mongoose = require("mongoose");

const EstablishmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false,
        trim: true
    }
});

const StatisticSchema = new mongoose.Schema({
    economy: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    order: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    health: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    diplomacy: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    }
});



StatisticSchema.statics.convertToArray = async function() {
    const stat = this;
    return [stat.economy, stat.order, stat.health, stat.diplomacy];
};

const StrategySchema = new mongoose.Schema({
    economy: {
        type: String,
        required: false,
        default: "revitalize",
        enum: ["revitalize", "stablize", "hands off"]
    },
    order: {
        type: String,
        required: false,
        default: "iron fist",
        enum: ["iron fist", "strict rule", "weak enforcement"]
    },
    health: {
        type: String,
        required: false,
        default: "active prevention",
        enum: ["active prevention", "reactive response", "no testing"]
    },
    diplomacy: {
        type: String,
        required: false,
        default: "hawk",
        enum: ["hawk", "neutral", "dove"]
    }
});

StrategySchema.statics.calculateStatChange = async function() {
    const strat = this;

    const statChange = {
        economy: 0,
        order: 0,
        health: 0,
        diplomacy: 0
    };

    const flattenEcon = false;
    const flattenDiplomacy = false;
    const flattenHealth = false

    switch (strat.economy) {
        case "revitalize": // sacrifice order and health to increase economy
            statChange.economy += random(2, 5);
            statChange.order -= random(1, 3);
            statChange.health -= random(1, 3);
            break;
        case "stablize": // slow economy growth
            flattenEcon = true;
            statChange.economy += random(0, 2);
            statChange.order += random(0, 1);
            statChange.health -= random(0, 1);
            break;
        case "hands off": // random outcome
            statChange.economy += random(-5, 4);
            break;
        default:
            // no change by default
            break;
    }

    switch (strat.order) {
        case "iron fist": // increase order and health significantly but reduce all other
            statChange.economy -= random(1, 8);
            statChange.order += random(5, 10);
            statChange.health += (3, 7);
            // Strict ruling leaves room for enemy countries to attack your image
            statChange.diplomacy -= random(5, 10);
            break;
        case "strict rule": // increase order and health, reduce all other slightly
            statChange.economy -= random(1, 3);
            statChange.order += random(3, 6);
            statChange.health += (1, 3);
            // Strict ruling leaves room for enemy countries to attack your image
            statChange.diplomacy -= random(1, 5);
            break;
        case "weak enforcement": // decrease order and randomly change other stats
            statChange.economy += random(-1, 2);
            statChange.order += random(-5, -3);
            statChange.health += (-2, 0);
            statChange.diplomacy += random(-1, 3);
            break;
        default:
            // no change by default
            break;
    }

    switch (strat.health) {
        case "active prevention": // people are healthy but economy is at loss
            statChange.economy += random(-15, -10);
            statChange.order += random(0, 3);
            statChange.health += (5, 10);
            break;
        case "reactive response": // flatten negative health and reduce economy slightly
            flattenHealth = true;
            statChange.economy += random(-5, -1);
            statChange.health += (0, 3);
            break;
        case "no testing": // decrease health but save money
            statChange.economy += random(0, 4);
            statChange.order += random(-3, 0);
            statChange.health += (-5, -2);
            break;
        default:
            // no change by default
            break;
    }

    switch (strat.diplomacy) {
        case "hawk": // be aggressive to foreign country is a gesture of power
            statChange.order += random(0, 5);
            statChange.diplomacy -= random(0, 6);
            break;
        case "neutral": // flatten diplomacy change
            flattenDiplomacy = true;
            break;
        case "dove": // increase diplomacy by cutting import tax
            statChange.economy += random(-4, 0);
            statChange.diplomacy += random(0, 6);
            break;
        default:
            // no change by default
            break;
    }
    if (flattenEcon && statChange.economy < 0) {
        statChange.economy = statChange.economy / 2;
    }
    if (flattenDiplomacy && statChange.diplomacy < 0) {
        statChange.diplomacy = statChange.diplomacy / 2;
    }
    if (flattenHealth && statChange.health < 0) {
        statChange.health = statChange.health / 2;
    }

    return statChange;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


const StatChangeSchema = new mongoose.Schema({
    economy: {
        type: Number,
        required: false,
        default: 0
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

const StatChange = mongoose.model("StatChange", StatChangeSchema);

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
        default: new StatChange()
    }
});



const GameplaySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Usernames need to be unique
        minLength: 3,
        lowercase: true,
        trim: true
    },
    statistic: {
        type: StatisticSchema,
        required: true
    },
    establishment: {
        type: [EstablishmentSchema],
        required: false,
        unique: false
    },
    log: {
        type: [LogSchema],
        required: false,
        unique: false
    },
    strategy: {
        type: StrategySchema,
        required: true,
        unique: false
    }
});

// Find a user's gameplay statistics by their username
GameplaySchema.statics.findByUsername = async function(username) {
    const User = this;

    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return false;
        } else {
            return user;
        };
    } catch (err) {
        console.log(err);
    }
};

const Gameplay = mongoose.model("Gameplay", GameplaySchema);
const Log = mongoose.model("Log", LogSchema);
const Establishment = mongoose.model("Establishment", EstablishmentSchema)

module.exports = { Gameplay, Log, Establishment };