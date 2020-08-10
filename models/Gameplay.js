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

StatisticSchema.static.convertToArray = async function() {
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
        required: false
    },
    log: {
        type: [LogSchema],
        required: false
    },
    stategy: {
        type: StrategySchema,
        required: true
    }
});

// Find a user's gameplay statistics by their username
GameplaySchema.static.findByUsername = async function(username) {
    const User = this;

    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return Promise.reject(false);
        } else {
            return user;
        };
    } catch (err) {
        console.log(err);
    }
};

const Gameplay = mongoose.model("Gameplay", GameplaySchema);

module.exports = { Gameplay };