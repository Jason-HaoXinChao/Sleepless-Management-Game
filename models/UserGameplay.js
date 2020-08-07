/* User, establishment, statistics, log, strategies model */

const mongoose = require("mongoose");

const EstablishmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
});

const StatisticSchema = new mongoose.Schema({
    economy: {
        type: Number,
        required: true,
        min: 0
    },
    order: {
        type: Number,
        required: true,
        min: 0
    },
    health: {
        type: Number,
        required: true,
        min: 0
    },
    diplomacy: {
        type: Number,
        required: true,
        min: 0
    }
});

const StrategySchema = new mongoose.Schema({
    economy: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    order: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    health: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    diplomacy: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    }
});

const StatChangeSchema = new mongoose.Schema({
    economy: {
        type: Number,
        required: false,
        default: 0,
        enum: ["revitalize", "stablize", "hands off"]

    },
    order: {
        type: Number,
        required: false,
        default: 0,
        enum: ["iron fist", "strict rule", "weak enforcement"]
    },
    health: {
        type: Number,
        required: false,
        default: 0,
        enum: ["active prevention", "reactive response", "no testing"]
    },
    diplomacy: {
        type: Number,
        required: false,
        default: 0,
        enum: ["hawk", "neutral", "dove"]
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

const UserGameplaySchema = new mongoose.Schema({
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
        required: true
    },
    log: {
        type: [LogSchema],
        required: true
    },
    stategy: {
        type: StrategySchema,
        required: true
    }
});

// Find a user's gameplay statistics by their username
UserGameplaySchema.static.findByUsername = async function(username) {
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

const UserGameplay = mongoose.model("User", UserGameplaySchema);

module.exports = { UserGameplay };