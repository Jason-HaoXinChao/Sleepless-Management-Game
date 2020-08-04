/* User, establishment, statistics, log, strategies model */

const mongoose = require("mongoose");

const EstablishmentSchema = new mongoose.Schema({
    name: String,
    code: Number,
    description: String
});

const StatisticSchema = new mongoose.Schema({
    economy: Number,
    order: Number,
    health: Number,
    diplomacy: Number
});

const StrategySchema = new mongoose.Schema({
    economy: String,
    order: String,
    health: String,
    diplomacy: String
});

const LogSchema = new mongoose.Schema({
    time: String,
    content: String,
    econChange: Number,
    orderChange: Number,
    healthChange: Number,
    diplomacyChange: Number
});

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    statistic: StatisticSchema,
    establishment: [EstablishmentSchema],
    log: [LogSchema],
    stategy: StrategySchema
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };