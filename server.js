'use strict';
const log = console.log;

// Express
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Mongo and Mongoose
const { mongoose } = require('./db/mongoose');
const { ObjectID } = require('mongodb');
mongoose.set('bufferCommands', false);
mongoose.set('useFindAndModify', false);

// Import our models
const { Credential } = require("./models/Credential");
const { EstablishmentInfo, EventChoice, RandomEvent } = require("./models/SystemData");
const { Gameplay, Log, Establishment, StatChange } = require("./models/Gameplay");
const { Profile } = require("./models/Profile");
const { Diplomacy } = require("./models/Diplomacy");
const { PatchNotes } = require("./models/PatchNotes");
const { Feedback } = require("./models/Feedback");

// express-session for managing user sessions
const session = require('express-session')
app.use(bodyParser.urlencoded({ extended: true }));

// import the mongoose model
const { UserIcon, UserFlag } = require("./models/UserIcon");

// multipart middleware: allows you to access uploaded file from req.file
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

// cloudinary configurations
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'team32',
    api_key: '923645855641674',
    api_secret: 'sGmSqdECgf6T7XSMYxDGGj4kSRo'
});

// handlebars server-side templating engine
const exphbs = require('express-handlebars');
const SystemData = require('./models/SystemData');
// Disable the default layout and change the default handlebars extension to '.html' for simplicity
const hbs = exphbs.create({
    defaultLayout: null,
    extname: '.html'
});
// Register the engine
app.engine('.html', hbs.engine);
// Set the view engine to use the 
app.set('view engine', '.html');
// Change the handlebars directory from '/views' (default) to '/public'
app.set('views', path.join(__dirname, '/public'));

app.use(session({
    secret: 'team32',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + (24 * 60 * 60 * 1000)), // Set the cookie to expire in a day
        httpOnly: true
    }
}));

// Helper function which checks for the error returned by the promise rejection if Mongo database suddently disconnects
function isMongoError(error) {
    return typeof error === 'object' && error !== null && error.name === "MongoNetworkError";
};

/**
 * Middleware for checking a user's session
 * If the user is an admin user - redirect them to the '/admin_dashboard' route
 * If the user is currently logged in, but isn't an admin user - redirect them to the '/gameplay' route 
 */
const sessionChecker = (req, res, next) => {
    if (req.session.is_admin) {
        res.redirect('/admin_dashboard');
    } else if (req.session.user) {
        res.redirect('/gameplay');
    } else {
        next();
    }
};

// Middleware that redirects a non-admin user to the '/gameplay' route if they try to access admin specific routes
const regUserRedirectChecker = (req, res, next) => {
    if (!req.session.is_admin) {
        res.redirect('/gameplay');
    } else {
        next();
    }
}

// Middleware that redirects an admin user to the '/admin_dashboard' route if they try to access a non-admin route
const adminRedirectChecker = (req, res, next) => {
    if (req.session.is_admin) {
        res.redirect('/admin_dashboard');
    } else {
        next();
    }
}

// Middleware for checking if user is currently logged out in order to redirect them to the login/register page ('/welcome' route) if necessary 
const loggedOutRedirectChecker = (req, res, next) => {
    // Checks if the user is logged in
    if (req.session.user) {
        // If the user is logged in, proceed
        next();
    } else {
        // Otherwise, redirect the user to the login/register page ('/welcome' route)
        res.redirect('/welcome');
    }
}

// Middleware for mongo connection error for routes that need it
const mongoChecker = (req, res, next) => {
    // check mongoose connection established.
    if (mongoose.connection.readyState != 1) {
        log('Issue with mongoose connection');
        res.status(500).send('Internal Server Error');
        return;
    } else {
        next();
    }
};

// Middleware for checking to ensure that regular user requests are only made by a logged-in user
const regUserRequestChecker = (req, res, next) => {
    if (!req.session.user) {
        res.status(401).send("Unauthorized");
        return;
    } else {
        next();
    }
};

// Middleware for checking to ensure that admin-only request are only made by an admin user 
const adminRequestChecker = (req, res, next) => {
    if (!req.session.is_admin) {
        res.status(401).send("Unauthorized");
        return;
    } else {
        next();
    }
};

/**
 *  Register Route
 *  Expected body:
 *      {
 *          username: <username>,
 *          password: <password>,
 *          email: <an email address containing @>,
 *          birthday: <a string in the format YYYY-MM-DD>
 *      }
 */
app.post("/api/register", mongoChecker, async(req, res) => {
    // Create a Credential model instance for the user's inputted username, email, password, and birthday
    const credentials = new Credential({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        birthday: req.body.birthday
    });

    const profile = new Profile({
        username: req.body.username,
        email: req.body.email,
        countryname: `country-${Math.random().toString(36).substr(2, 8)}`
    });

    const curr = new Date();
    const gameplayData = new Gameplay({
        username: req.body.username,
        statistic: {
            economy: 50,
            order: 50,
            health: 50,
            diplomacy: 50
        },
        establishment: [new Establishment({
            name: "Pandemic Outbreak"
        })],
        log: [new Log({
            time: ("0" + curr.getHours()).slice(-2) + ":" + ("0" + curr.getMinutes()).slice(-2),
            content: "You became the ruler of your country."
        })],
        strategy: {}
    });

    const diplomacy = new Diplomacy({
        username: req.body.username,
        connection: []
    });

    // Save the user credentials to the the database
    try {
        const user = await credentials.save();
        if (!user) {
            res.status(500).send("500 Internal Server Error");
            return;
        }

        const userProfile = await profile.save();
        if (!userProfile) {
            res.status(500).send("500 Internal Server Error");
            return;
        }

        const data = await gameplayData.save();
        if (!data) {
            res.status(500).send("500 Internal Server Error");
            return;
        }

        const friendsList = await diplomacy.save();
        if (!friendsList) {
            res.status(500).send("500 Internal Server Error");
            return;
        }

        req.session.user = user._id;
        req.session.username = user.username;
        req.session.email = user.email;
        req.session.is_admin = user.is_admin;

        res.redirect('/gameplay');
    } catch (err) {
        if (isMongoError(err)) {
            res.status(500).redirect('/welcome');
        } else {
            res.status(400).redirect('/welcome');
        }
    }
});

/**
 *  Login Route
 *  Expected body:
 *      {
 *          username: <username>,
 *          password: <password>
 *      }
 */
app.post("/api/login", mongoChecker, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Search for the user credentials in the database based on the user's inputted username and page  
    Credential.findByUsernamePassword(username, password).then((user) => {
        // If the user credentials cannot be found, redirect the user back to the welcome page ('/welcome' route)
        if (!user) {
            res.status(404).redirect('/welcome?invalid=credentials');
        } else if (user.is_banned) {
            res.status(401).redirect('/welcome?invalid=banned');
        } else {
            // Otherwise, set the session data accordingly...
            req.session.user = user._id;
            req.session.username = user.username;
            req.session.email = user.email;
            req.session.is_admin = user.is_admin;
            // ...and redirect the (now logged-in) user to the gameplay page ('/gameplay' page)
            res.redirect('/gameplay');
        }
    }).catch((err) => {
        if (isMongoError(err)) {
            res.status(500).redirect('/welcome');
        } else {
            res.status(400).redirect('/welcome');
        }
    });
});

// Logout Route
app.post("/api/logout", (req, res) => {
    // Destroy the session data
    req.session.destroy(err => {
        if (err) {
            res.status(500).send(err);
        } else {
            // Redirect the user back to the root route (which will then redirect to the welcome page ('welcome' /route))
            res.redirect('/');
        }
    });
});


/** 
 * Route for getting gameplay related statistic of user.
 * Expected request body: none, server checks the currently logged in user through cookie
 * ":type" indicates which statistic of the user is being requested, possible options:
 * all: send the entire user document
 * name: send the username
 * stat: send statistic property 
 * log: send log property
 * strategy: send strategy property
 */
app.get("/api/user/gameplay/stat/:type/:username?", mongoChecker, (req, res) => {
    const username = req.params.username ? req.params.username : req.session.username;
    const reqType = req.params.type;

    Gameplay.findByUsername(username).then((user) => {
        if (!user) {
            // Either client's cookie is corrupted or user has been deleted by admin
            // Logging the user out should be appropriate
            res.status(500).send();
        } else {
            // send document according to user request type
            switch (reqType) {
                case "all":
                    res.send(user);
                    break;
                case "name":
                    res.send(user.username);
                    break;
                case "stat":
                    res.send(user.statistic);
                    break;
                case "log":
                    res.send(user.log);
                    break;
                case "strategy":
                    res.send(user.strategy);
                    break;
                default:
                    res.send(user);
                    break;
            };
        };
    }).catch((err) => {
        if (isMongoError(err)) {
            res.status(500).send();
        } else {
            // Either client's cookie is corrupted or user has been deleted by admin
            // Logging the user out should be appropriate
            res.status(400).send();
        };
    });
});

/**
 * Route for getting information of specific establishment
 * expected request body:
 * {
 *  name: String
 * }
 * expected return:
 * {
 * name:String,
 * description: String,
 * statChange: [number]
 * }
 */
app.post("/api/user/gameplay/EstInfo", mongoChecker, (req, res) => {
    const establishmentName = req.body.name;

    EstablishmentInfo.findByName(establishmentName).then((establishment) => {
        if (!establishment) {
            // Something is desync in the client or server side, log the user out and make them reload the page
            res.status(400).send();
        } else {
            const output = {
                name: establishment.name,
                description: establishment.description,
                statChange: establishment.statChange.convertToArray()
            };
            res.send(output);
        }
    }).catch((err) => {
        if (isMongoError(err)) {
            res.status(500).send();
        } else {
            log(err);
            // Something is desync in the client or server side, log the user out and make them reload the page
            res.status(400).send();
        };
    });
});

/**
 * Route for changing user's strategy
 * expected request body: none
 * expected return value: 
 * {
 *  log: Log object
 * }
 * parameters
 * strategyType: which strategy is being change(economy/order/health/diplomacy)
 * value: the new choice of strategy for that field
 */
app.post("/api/user/gameplay/strategy/:type/:value", mongoChecker, (req, res) => {
    const type = req.params.type;
    const value = req.params.value;
    const username = req.session.username;

    Gameplay.findByUsername(username).then((user) => {
        if (!user) {
            // Either client's cookie is corrupted or user has been deleted by admin
            // Logging the user out should be appropriate
            res.status(404).send();
        } else {
            // apply the change of strategy
            switch (type.toLowerCase()) {
                case "economy":
                    user.strategy.economy = value.toLowerCase();
                    break;
                case "order":
                    user.strategy.order = value.toLowerCase();
                    break;
                case "health":
                    user.strategy.health = value.toLowerCase();
                    break;
                case "diplomacy":
                    user.strategy.diplomacy = value.toLowerCase();
                    break;
                default:
                    user.strategy.economy = value.toLowerCase();
                    break;
            };
            const curr = new Date();
            const timeString = ("0" + curr.getHours()).slice(-2) + ":" + ("0" + curr.getMinutes()).slice(-2);
            const log = new Log({
                time: timeString,
                content: "Your " + type + " strategy has been changed to [" + value + "]."
            });
            user.log.push(log);
            // save document
            user.save((err, user) => {
                if (err) {
                    res.status(500).send();
                } else {
                    // Send the log to client
                    res.status(200).send({ log: log });
                }
            });
        };
    }).catch((err) => {
        if (isMongoError(err)) {
            res.status(500).send();
        } else {
            // Something is desync in the client or server side, log the user out and make them reload the page
            res.status(500).send();
        };
    });
});

/**
 * Route for submitting a randomEvent choice
 * Expected request body:
 * {
 *  eventName: String,
 *  choice: string
 * }
 * Expected return value:
 * {
 *  establishment: String or null,
 *  log: Object  (see logSchema in /models/Gameplay)
 *  newStatistic: object (see StatisticSchema)
 * }
 */
app.post("/api/user/gameplay/event", mongoChecker, (req, res) => {
    const username = req.session.username;
    const eventName = req.body.eventName;
    const choice = req.body.choice;


    Gameplay.findByUsername(username).then((user) => {
        if (!user) {
            // Either client's cookie is corrupted or user has been deleted by admin
            // Logging the user out should be appropriate
            res.status(404).send();
        } else {
            // TODO: implement following

            // find the event document from database
            RandomEvent.findByName(eventName).then((evt) => {
                if (!evt) {
                    res.status(500).send();
                    return;
                } else if (evt.name == "Game Over") {
                    // This is the game over event.
                    // Choice 1 means the user's gameplay data gets wiped and restarts the game
                    // Choice 2 means proceed as usual but don't add new log if user already has that log
                    const output = {};
                    if (evt.choiceOne.description == choice) { // choice 1
                        // Reset the user's gameplay data to the initial state (except strategy)

                        // Set all statistics to 50
                        user.statistic.economy = 50;
                        user.statistic.order = 50;
                        user.statistic.health = 50;
                        user.statistic.diplomacy = 50;
                        // Remove all establishment and log except for the first one
                        user.establishment = user.establishment.slice(0, 1);
                        user.log = user.log.slice(0, 1);
                        user.save().then((user) => {
                            if (!user) {
                                res.status(404).send();
                            } else {
                                res.status(200).send({});
                            }
                        }).catch((err) => {
                            log(err);
                            res.status(500).send();
                        });
                    } else { // choice 2
                        let gameAlreadyOver = false;
                        user.establishment.forEach(est => {
                            if (est.name == "Failed State") {
                                gameAlreadyOver = true;
                            }
                        });
                        if (gameAlreadyOver) {
                            // This means the user already have the "Game Over" establishment and corresponding log, so just send nothing and let client handle it.
                            res.status(200).send({});
                        } else {
                            // generate log (should be preset in EventChoice document but with no time)
                            const curr = new Date();
                            output.log = {
                                time: ("0" + curr.getHours()).slice(-2) + ":" + ("0" + curr.getMinutes()).slice(-2),
                                content: evt.choiceTwo.log.content,
                                statChange: evt.choiceTwo.log.statChange
                            };
                            output.establishment = evt.choiceTwo.newEstablishment;
                            user.log.push(output.log);
                            user.establishment.push({ name: output.establishment });
                            user.save().then((user) => {
                                if (!user) {
                                    res.status(404).send();
                                } else {
                                    res.status(200).send(output);
                                }
                            }).catch((err) => {
                                log(err);
                                res.status(500).send();
                            });
                        }
                    }

                } else {
                    // get the corresponding EventChoice document
                    let choiceDoc;

                    if (evt.choiceOne.description == choice) {
                        choiceDoc = evt.choiceOne;
                    } else {
                        choiceDoc = evt.choiceTwo;
                    }

                    const output = {};

                    // calculate the new statistics (apply statChange in EventChoice document)
                    user.statistic.economy += choiceDoc.statChange.economy;
                    if (user.statistic.economy > 100) {
                        user.statistic.economy = 100;
                    } else if (user.statistic.economy < 0) {
                        user.statistic.economy = 0;
                    }
                    user.statistic.order += choiceDoc.statChange.order;
                    if (user.statistic.order > 100) {
                        user.statistic.order = 100;
                    } else if (user.statistic.order < 0) {
                        user.statistic.order = 0;
                    }
                    user.statistic.health += choiceDoc.statChange.health;
                    if (user.statistic.health > 100) {
                        user.statistic.health = 100;
                    } else if (user.statistic.health < 0) {
                        user.statistic.health = 0;
                    }
                    user.statistic.diplomacy += choiceDoc.statChange.diplomacy;
                    if (user.statistic.diplomacy > 100) {
                        user.statistic.diplomacy = 100;
                    } else if (user.statistic.diplomacy < 0) {
                        user.statistic.diplomacy = 0;
                    }
                    output.newStatistic = user.statistic;

                    // generate log (should be preset in EventChoice document but with no time)
                    const curr = new Date();
                    output.log = {
                        time: ("0" + curr.getHours()).slice(-2) + ":" + ("0" + curr.getMinutes()).slice(-2),
                        content: choiceDoc.log.content,
                        statChange: choiceDoc.log.statChange
                    }

                    // Save the new statistic, log, and establishment(if any) in user
                    if (choiceDoc.newEstablishment) {
                        // Check if the user already have this establishment
                        //don't add it to the user's establishment collection if the user already have it.
                        let exist = false;
                        user.establishment.forEach(est => {
                            if (est.name == choiceDoc.newEstablishment) {
                                exist = true;
                            }
                        });
                        if (!exist) {
                            user.establishment.push({ "name": choiceDoc.newEstablishment });
                            output.establishment = choiceDoc.newEstablishment;
                        } else {
                            output.establishment = null;
                        }
                    } else {
                        output.establishment = null;
                    }

                    user.save().then((user) => {
                        if (!user) {
                            log(err);
                            res.status(404).send();
                        } else {
                            // Send the expected return value to client
                            res.send(output);
                        }
                    }).catch((err) => {
                        log(err);
                        // server error can't save
                        res.status(500).send();
                    });
                }
            });

        }
    }).catch((err) => {
        if (isMongoError(err)) {
            log(err);
            res.status(500).send();
        } else {
            log(err);
            // Something is desync in the client or server side, log the user out and make them reload the page
            res.status(500).send();
        };
    });
});

/**
 * Route for requesting an update
 * Expected request body: none
 * Expected return value:
 * {
 * newStat: Object  (see StatisticSchema in /models/Gameplay),
 * log: Object  (see logSchema in /models/Gameplay)
 * randomEvent: {
 *                  name:String,
 *                  description: String,
 *                  choiceOne: String,
 *                  choiceTwo: String
 *              }
 * }
 */
app.get("/api/user/gameplay/update", mongoChecker, (req, res) => {
    const username = req.session.username;

    Gameplay.findByUsername(username).then((user) => {

        if (!user) {
            // Either client's cookie is corrupted or user has been deleted by admin
            // Logging the user out should be appropriate
            res.status(404).send();
        } else {
            // TODO: implement following
            log("updating for user: " + username);
            let statisticChange = {
                economy: 0,
                order: 0,
                health: 0,
                diplomacy: 0
            };
            let failedState = false;
            let i = 0;
            while (!failedState && i < user.establishment.length) {
                if (user.establishment[i].name == "Failed State") {
                    failedState = true;
                }
                i++;
            }

            if (failedState) { // Game ended, skip checking for stats, send Game Over event.
                const output = {};
                RandomEvent.findByName("Game Over").then((evt) => {
                    if (!evt) {
                        log("Can't find randomEvent due to server issue");
                    } else {
                        output.randomEvent = {
                            name: evt.name,
                            description: evt.description,
                            choiceOne: evt.choiceOne.description,
                            choiceTwo: evt.choiceTwo.description
                        };
                        // Since statistic of gameover player doesn't change, there is no newStat or log to save processing power.
                        res.send(output);
                    }
                }).catch((err) => {
                    log(err);
                    res.status(500).send();
                });

            } else { // Normal player, game haven't ended

                // Calculate new statistics (tally strategy and establishment)

                // change in statistics due to strategy
                user.strategy.calculateStatChange().then((stratImpact) => {
                    statisticChange.economy += stratImpact.economy;
                    statisticChange.order += stratImpact.order;
                    statisticChange.health += stratImpact.health;
                    statisticChange.diplomacy += stratImpact.diplomacy;
                    // change in statistics due to establishment
                    (user.establishment).forEach((est) => {
                        EstablishmentInfo.findByName(est.name).then((establishment) => {
                            const estImpact = establishment.statChange.convertToArray();
                            statisticChange.economy += estImpact[0];
                            statisticChange.order += estImpact[1];
                            statisticChange.health += estImpact[2];
                            statisticChange.diplomacy += estImpact[3];
                        }).catch((err) => {
                            log(err);
                            res.status(500).send();
                        });

                    });

                    // Formulate log
                    const currTime = new Date();
                    // Generate log
                    const eventLog = new Log({
                        time: ("0" + currTime.getHours()).slice(-2) + ":" + ("0" + currTime.getMinutes()).slice(-2),
                        content: "A week has passed.",
                        statChange: new StatChange({
                            economy: statisticChange.economy,
                            health: statisticChange.health,
                            order: statisticChange.order,
                            diplomacy: statisticChange.diplomacy
                        })
                    });
                    let gameOver = false;
                    // Change statistics and add log to user document
                    user.statistic.economy += statisticChange.economy;
                    if (user.statistic.economy > 100) {
                        user.statistic.economy = 100;
                    } else if (user.statistic.economy <= 0) {
                        user.statistic.economy = 0;
                        gameOver = true;
                    }
                    user.statistic.order += statisticChange.order;
                    if (user.statistic.order > 100) {
                        user.statistic.order = 100;
                    } else if (user.statistic.order <= 0) {
                        user.statistic.order = 0;
                        gameOver = true;
                    }
                    user.statistic.health += statisticChange.health;
                    if (user.statistic.health > 100) {
                        user.statistic.health = 100;
                    } else if (user.statistic.health <= 0) {
                        user.statistic.health = 0;
                        gameOver = true;
                    }
                    user.statistic.diplomacy += statisticChange.diplomacy;
                    if (user.statistic.diplomacy > 100) {
                        user.statistic.diplomacy = 100;
                    } else if (user.statistic.diplomacy <= 0) {
                        user.statistic.diplomacy = 0;
                        gameOver = true;
                    }

                    user.log.push(eventLog);

                    // save user document
                    user.save().then((user) => {
                        const output = {
                            newStat: user.statistic,
                            log: eventLog,
                            randomEvent: null
                        };
                        if (!gameOver) {
                            // Ask RNGesus if there should be a random event
                            const percentageChance = 15; // percentage chance of event occuring
                            if (Math.floor(Math.random() * (100 - 0)) + 0 <= percentageChance) {
                                // chooce a random event
                                RandomEvent.countDocuments().exec(function(err, count) {
                                    if (err) {
                                        log(err);
                                    } else {
                                        const random = Math.floor(Math.random() * count);

                                        RandomEvent.findOne().skip(random).exec(
                                            function(err, randomEvent) {
                                                if (err) {
                                                    log(err);
                                                }

                                                if (!randomEvent) {
                                                    log("Can't find randomEvent due to server issue");
                                                } else {
                                                    output.randomEvent = {
                                                        name: randomEvent.name,
                                                        description: randomEvent.description,
                                                        choiceOne: randomEvent.choiceOne.description,
                                                        choiceTwo: randomEvent.choiceTwo.description
                                                    };
                                                    res.send(output);
                                                }
                                            });
                                    }
                                });
                            } else {
                                res.send(output);
                            }
                        } else {
                            // If one of the 4 main statistics falls to or below 0, game is over
                            // Send the "Game Over" event to the user
                            RandomEvent.findByName("Game Over").then((evt) => {
                                if (!evt) {
                                    log("Can't find randomEvent due to server issue");
                                } else {
                                    output.randomEvent = {
                                        name: evt.name,
                                        description: evt.description,
                                        choiceOne: evt.choiceOne.description,
                                        choiceTwo: evt.choiceTwo.description
                                    };
                                    // Send new statistics, log and randomEvent(if any) to user
                                    res.send(output);
                                }
                            }).catch((err) => {
                                log(err);
                                res.status(500).send();
                            });
                        }
                    }).catch((err) => {
                        log(err);
                        res.status(500).send();
                    });
                }).catch((err) => {
                    log(err);
                    res.status(500).send();
                });
            }



        };
    }).catch((err) => {
        log(err);
        res.status(500).send();
    });
});

/**
 * Route for getting friends list in diplomacy page.
 * Expected request body: None
 * Expected return value:
 * {
 *  totalPage: Number
 *  connection: [String]    // each element is a user name, should send at most 6 each call
 * }
 */
app.get("/api/user/diplomacy/:pageNumber", mongoChecker, (req, res) => {
    const pagenum = req.params.pageNumber;
    const username = req.session.username;

    Diplomacy.findByUsername(username).then((data) => {
        if (!data) {
            // User not found, cookie corrupted or user deleted by admin
            res.status(400).send();
        } else {
            const output = {
                totalPage: Math.ceil(data.connection.length / 6),
                connection: data.connection.slice(6 * (pagenum - 1), 6 * pagenum)
            }
            res.status(200).send(output);
        }
    }).catch((err) => {
        log(err);
        res.status(500).send();
    })
});

/**
 * Route for getting the diplomatic status between a user and another user
 * expected parameter:
 *  username: String    // the username of the user you are checking your diplomatic status with
 */
app.get("/api/user/diplomacy/status/:username", mongoChecker, (req, res) => {
    const username = req.session.username;
    const ally = req.params.username;

    Diplomacy.findByUsername(username).then((data) => {
        if (!data) {
            // User not found, cookie corrupted or user deleted by admin
            res.status(404).send();
        } else {
            if (data.connection.includes(ally)) {
                res.send({
                    isAlly: true
                });
            } else {
                res.send({
                    isAlly: false
                });
            }
        }
    }).catch((err) => {
        log(err);
        res.status(500).end();
    })
});

/**
 * Route for adding a user to the diplomacy connection list
 * Expected Body:
 * {
 *  username: String    // username of the user to be added to the list
 * }
 * Expected output:
 * {
 *  status: String   // Should indicate one of: already ally, your list full, success
 * }
 * 
 * Current maximum number of diplomatic connection is 30
 */
app.post("/api/user/diplomacy/add", mongoChecker, (req, res) => {
    const username = req.session.username;
    const newAlly = req.body.username;

    Diplomacy.findByUsername(username).then((data) => {
        if (!data) {
            // User not found, cookie corrupted or user deleted by admin
            res.status(404).send();
        } else {
            if (data.connection.length == 30) {
                res.status(200).send({ status: "your list full" });
            } else if (data.connection.includes(newAlly)) {
                res.status(200).send({ status: "already ally" })
            } else {
                data.connection.push(newAlly);
                const saved = data.save();
                if (!saved) {
                    res.status(500).send();
                } else {
                    res.status(200).send({ status: "success" })
                }
            }
        }
    }).catch((err) => {
        log(err);
        res.status(500).send();
    })
});

/**
 * Route for removng a user from the diplomacy connection list
 * Expected Body:
 * {
 *  username: String    // username of the user to be removed from the list
 * }
 * Expected output:
 * {
 *  status: String   // Should indicate one of: not in list, success
 * }
 */
app.post("/api/user/diplomacy/delete", mongoChecker, (req, res) => {
    const username = req.session.username;
    const removeAlly = req.body.username;

    Diplomacy.findByUsername(username).then((data) => {
        if (!data) {
            // User not found, cookie corrupted or user deleted by admin
            res.status(404).send();
        } else {
            if (!data.connection.includes(removeAlly)) {
                res.status(200).send({ status: "not in list" })
            } else {
                data.connection = data.connection.filter(ally => ally !== removeAlly);
                const saved = data.save();
                if (!saved) {
                    res.status(500).send();
                } else {
                    res.status(200).send({ status: "success" });
                }
            }
        }
    }).catch((err) => {
        log(err);
        res.status(500).send();
    })
});


/**
 * Route for sending medical supply to ally
 * Expected Body:
 * {
 *  username: String    // username of the ally to send supply to
 *  amount: Number      // amount of supply to be sent
 * }
 * Expected output:
 * {
 *  status: String   // Should indicate one of: not enough supply, not in list, failed state, success
 * }
 * 
 * Current maximum number of diplomatic connection is 30
 */
app.post("/api/user/diplomacy/send", mongoChecker, (req, res) => {
    const username = req.session.username;
    const ally = req.body.username;
    const amount = req.body.amount;

    Diplomacy.findByUsername(username).then((data) => {
        if (!data) {
            // User not found, cookie corrupted or user deleted by admin
            res.status(404).send();
        } else {
            if (!data.connection.includes(ally)) {
                res.status(200).send({ status: "not in list" });
            } else {
                Gameplay.findByUsername(username).then((userData) => {
                    if (!userData) {
                        res.status(404).send();
                    } else if (userData.statistic.health <= amount) {
                        res.status(200).send({ status: "not enough supply" });
                    } else {
                        Gameplay.findByUsername(ally).then((allyData) => {
                            if (!allyData) {
                                res.status(404).send();
                            } else if (allyData.establishment.filter(est => est.name == "Failed State").length !== 0) {
                                res.status(200).send({ status: "failed state" });
                            } else {
                                userData.statistic.health -= amount;
                                allyData.statistic.health += amount;
                                if (allyData.statistic.health > 100) {
                                    allyData.statistic.health = 100;
                                }
                                const curr = new Date();
                                userData.log.push(new Log({
                                    time: ("0" + curr.getHours()).slice(-2) + ":" + ("0" + curr.getMinutes()).slice(-2),
                                    content: `You sent ${amount} medical supplies to your ally ${ally}.`,
                                    statChange: new StatChange({
                                        economy: 0,
                                        health: -amount,
                                        order: 0,
                                        diplomacy: amount
                                    })
                                }));
                                allyData.log.push(new Log({
                                    time: ("0" + curr.getHours()).slice(-2) + ":" + ("0" + curr.getMinutes()).slice(-2),
                                    content: `You received ${amount} medical supplies from a friendly country ruled by ${username}.`,
                                    statChange: new StatChange({
                                        economy: 0,
                                        health: amount,
                                        order: 0,
                                        diplomacy: 0
                                    })
                                }));
                                const userSaved = userData.save();
                                const allySaved = allyData.save();
                                if (userSaved && allySaved) {
                                    res.status(200).send({ status: "success" });
                                } else {
                                    res.status(500).send();
                                }
                            }
                        }).catch((err) => {
                            log(err);
                            res.status(500).send();
                        });
                    }
                }).catch((err) => {
                    log(err);
                    res.status(500).send();
                });
            }
        }
    }).catch((err) => {
        log(err);
        res.status(500).send();
    });
});

/**
 * Route for getting patch notes, note that there should only be 1 entry in the patchnote database at all times
 * expected output:
 * {
 *  notes: [Object] //content should follow the NoteSchema in ./models/PatchNotes
 * }
 */
app.get("/api/patchnote", mongoChecker, (req, res) => {

    PatchNotes.findOne().then((patchnotes) => {
        if (!patchnotes) {
            res.status(500).send("500 Internal Server Error");
        } else {
            res.status(200).send({ name: patchnotes.name, notes: patchnotes.notes });
        }
    }).catch((err) => {
        log(err);
        res.status(500).send("500 Internal Server Error");
    });
});

/**
 * Route for getting a user's profile info
 * optional parameters:
 *  A string corresponding to the user whose profile info you are getting
 */
app.get('/api/user/user_profile_info/:username?', async(req, res) => {
    const username = req.params.username ? req.params.username : req.session.username;

    const user_info = {
        username: username
    };

    try {
        const user_profile = await Profile.findByUsername(username);

        if (user_profile) {
            user_info.profile = user_profile;
        }

        const user_gameplay = await Gameplay.findByUsername(username);

        if (user_gameplay) {
            user_info.gameplay = user_gameplay;
        }

        res.send(user_info);
    } catch {
        res.send(user_info);
    }
});

/**
 * Route for saving a user's changes to the user profile info
 * expected data:
 * {
 *  age: Number
 *  country: String
 *  gender: String
 *  email: String   // A valid email string
 *  socialMedia: [String]   // An array of strings corresponding to social media accounts
 * }
 */
app.post('/api/user/user_profile_info', async(req, res) => {
    try {
        const profile = await Profile.findByUsername(req.session.username);

        Object.entries(req.body).forEach(([key, value]) => {
            profile[key] = value;
        });

        profile.save();
    } catch (err) {
        log(err);
    }
});

/**
 * Route for uploading a user's user icon
 * expected data:
 *  A file
 */
app.post('/api/user/upload_icon', multipartMiddleware, (req, res) => {
    cloudinary.uploader.upload(req.files.image.path, {
        eager: [
            { width: 200, height: 200, crop: "fill", gravity: "face" },
            { width: 40, height: 40, crop: "fill", gravity: "face" }
        ]
    }).then(image => {
        UserIcon.findByUsername(req.session.username).then((userIcon) => {
            if (userIcon) {
                cloudinary.uploader.destroy(userIcon.image_id);

                userIcon.image_id = image.public_id;
                userIcon.image_url = image.url;
                userIcon.format = image.format;
                userIcon.uploader = req.session.username;
                userIcon.created_at = image.created_at;

                userIcon.save().then(result => {
                    res.redirect("/user_profile?upload=success");
                }).catch(err => {
                    console.log(err);
                    res.status(500).redirect("/user_profile?upload=failed");
                });
            } else {
                var userIcon = new UserIcon({
                    image_id: image.public_id, // image id on cloudinary server
                    image_url: image.url,
                    format: image.format,
                    uploader: req.session.username, // keeps track of the user who uploaded this image
                    created_at: image.created_at // keeps track of when the user icon was created
                });

                userIcon.save().then(result => {
                    res.redirect("/user_profile?upload=success");
                }).catch(err => {
                    console.log(err);
                    res.status(500).redirect("/user_profile?upload=failed");
                });
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).redirect("/user_profile?upload=failed");
    });
});

/**
 * Route for getting a user's user icon
 * optional parameters:
 *  A string corresponding to the username of the user whose user icon you're getting
 */
app.get('/api/user/user_icon/:username?', (req, res) => {
    const username = req.params.username ? req.params.username : req.session.username;

    UserIcon.findByUsername(username).then(async(userIcon) => {
        if (userIcon) {
            res.send({
                avatar: cloudinary.image(`${userIcon.image_id}.${userIcon.format}`, {
                    transformation: [{
                        height: 40,
                        width: 40,
                        crop: "fill",
                        gravity: "face"
                    }]
                }),
                medium: cloudinary.image(`${userIcon.image_id}.${userIcon.format}`, {
                    transformation: [{
                        height: 150,
                        width: 150,
                        crop: "fill",
                        gravity: "face"
                    }]
                }),
                large: cloudinary.image(`${userIcon.image_id}.${userIcon.format}`, {
                    transformation: [{
                        height: 200,
                        width: 200,
                        crop: "fill",
                        gravity: "face"
                    }]
                })
            });
        } else {
            const user = await Profile.findByUsername(username);

            if (user) {
                res.send(false);
            } else {
                res.status(404).end();
            }
        }
    }).catch(err => {
        console.log(err);
        res.status(500).send("Internal Server Error");
    });
});

/**
 * Route for saving a user's change to their country's name
 * expected data:
 * {
 *  countryName: String // the update country name
 * }
 */
app.post('/api/user/change_country_name', mongoChecker, async(req, res) => {
    try {
        const country = await Profile.findByCountryName(req.body.countryName);
        if (country) {
            res.status(400).send('/user_profile?country_name=duplicate');
            return;
        }

        const profile = await Profile.findByUsername(req.session.username);
        profile.countryname = req.body.countryName;
        profile.save();
    } catch (err) {
        log(err);
        res.status(500).send("/user_profile?country_name=failed")
    }
});

/**
 * Route for uploader a user's flag
 * expected data:
 *  A file
 */
app.post('/api/user/upload_flag', multipartMiddleware, (req, res) => {
    cloudinary.uploader.upload(req.files.image.path).then(image => {
        UserFlag.findByUsername(req.session.username).then((userFlag) => {
            if (userFlag) {
                cloudinary.uploader.destroy(userFlag.image_id);

                userFlag.image_id = image.public_id;
                userFlag.image_url = image.url;
                userFlag.uploader = req.session.username;

                userFlag.save().then(result => {
                    res.redirect("/user_profile?upload=success");
                }).catch(err => {
                    console.log(err);
                    res.status(500).redirect("/user_profile?upload=failed");
                });
            } else {
                var userFlag = new UserFlag({
                    image_id: image.public_id, // image id on cloudinary server
                    image_url: image.url,
                    uploader: req.session.username
                });

                userFlag.save().then(result => {
                    res.redirect("/user_profile?upload=success");
                }).catch(err => {
                    console.log(err);
                    res.status(500).redirect("/user_profile?upload=failed");
                });
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(500).redirect("/user_profile?upload=failed");
    });
});

/**
 * Route for getting a user's flag
 * expected output:
 * {
 *  url: String // string corresponding to the url of the image
 * }
 */
app.get('/api/user/user_flag/:username?', (req, res) => {
    const username = req.params.username ? req.params.username : req.session.username;

    UserFlag.findByUsername(username).then(async(userFlag) => {
        if (userFlag) {
            res.send({
                url: userFlag.image_url
            });
        } else {
            const user = await Profile.findByUsername(username);

            if (user) {
                res.send(false);
            } else {
                res.status(404).end();
            }
        }
    }).catch(err => {
        console.log(err);
        res.status(500).send("Internal Server Error");
    });
});

/**
 * Route for getting an array of users sorted by the sum of their gameplay statistics
 * expected output:
 *  [Object] // An array of Gameplay documents sorted in descending order based on the sum of their gameplay statistic
 */
app.get("/api/user/leaderboard", mongoChecker, async(req, res) => {
    try {
        const user_gameplay = await Gameplay.find();

        user_gameplay.sort((first_user, second_user) => {
            const first_user_sum = first_user.statistic.economy + first_user.statistic.order + first_user.statistic.health + first_user.statistic.diplomacy;
            const second_user_sum = second_user.statistic.economy + second_user.statistic.order + second_user.statistic.health + second_user.statistic.diplomacy;

            return second_user_sum - first_user_sum;
        });

        res.send(user_gameplay);
    } catch (err) {
        log(err);        
        res.status(500).end();
    }
});

/**
 * Admin-only route for deleting a user's user icon
 * expected parameter:
 *  A string corresponding to the username of the user whose user icon you are deleting
 */
app.delete('/api/admin/delete_icon/:username', mongoChecker, adminRequestChecker, (req, res) => {
    const username = req.params.username;

    // Find the user icon according to the provided username
    UserIcon.findByUsername(username).then(userIcon => {
        // Get the user icon's image ID
        const imageId = userIcon.image_id;

        // Delete the user icon (by imageId) from the cloudinary server
        cloudinary.uploader.destroy(imageId, function(result) {
            // Remove the user icon from the database
            userIcon.remove();
            res.end();
        });
    }).catch(err => {
        res.status(500).send("Internal Server Error");
    });
});

/**
 * Admin-only route for getting a user's user info
 * expected parameter:
 *  A string corresponding to the username of the user whose user info you are getting
 */
app.get("/api/admin/user_info/:username", adminRequestChecker, mongoChecker, (req, res) => {
    const username = req.params.username;

    Profile.findByUsername(username).then((user) => {
        if (!user) {
            res.status(404).send();
        } else {
            res.send(user);
        };
    }).catch((err) => {
        if (isMongoError(err)) {
            res.status(500).send("Internal Server Error");
        } else {
            log(err);
        };
    });
});

/**
 * Admin-only route for getting a user's gameplay statistics
 * expected parameter:
 *  A string corresponding to the username of the user whose gameplay statistics you are getting
 */
app.get("/api/admin/gameplay_stat/:username", adminRequestChecker, mongoChecker, (req, res) => {
    const username = req.params.username;

    Gameplay.findByUsername(username).then((user) => {
        if (!user) {
            res.status(404).send();
        } else {
            res.send(user.statistic);
        };
    }).catch((err) => {
        if (isMongoError(err)) {
            res.status(500).send("Internal Server Error");
        } else {
            log(err);
        };
    });
});

/**
 * Admin-only route for getting a user's ban status
 * expected parameter:
 *  A string corresponding to the username of the user whose ban status you are getting
 */
app.get("/api/admin/ban_status/:username", mongoChecker, adminRequestChecker, async(req, res) => {
    const username = req.params.username;

    try {
        const is_banned = await Credential.getBanStatusByUsername(username);

        if (is_banned === 'Not Found') {
            res.status(404).send();
        } else {
            res.send(is_banned);
        }
    } catch {
        if (isMongoError(err)) {
            res.status(500).send("Internal Server Error");
        } else {
            log(err);
        };
    }
});

/**
 * Admin-only route for changing a user's gameplay statistic
 * expected parameter:
 *  A string corresponding to the username of the user whose ban status you are getting
 * expected data:
 * {
 *  economy: Number // a number from 0 to 100
 *  order: Number // a number from 0 to 100
 *  health: Number // a number from 0 to 100
 *  diplomacy: Number // a number from 0 to 100
 * }
 */
app.post("/api/admin/change_stats/:username", adminRequestChecker, mongoChecker, async(req, res) => {
    const username = req.params.username;

    Gameplay.findByUsername(username).then((user) => {
        if (!user) {
            res.status(404).send();
            return;
        }

        const statisticChange = {
            economy: req.body.economy - user.statistic.economy,
            order: req.body.order - user.statistic.order,
            health: req.body.health - user.statistic.health,
            diplomacy: req.body.diplomacy - user.statistic.diplomacy
        };

        const currTime = new Date();
        // Generate log
        const log = new Log({
            time: ("0" + currTime.getHours()).slice(-2) + ":" + ("0" + currTime.getMinutes()).slice(-2),
            content: "How mysterious! An otherworldly influence has been bestowed upon you...",
            statChange: statisticChange
        });

        // Change statistics and add log to user document
        const stat = user.statistic;
        stat.economy = req.body.economy;
        stat.order = req.body.order;
        stat.health = req.body.health;
        stat.diplomacy = req.body.diplomacy;
        user.log.push(log);

        return user;
    }).then((user) => {
        // save user document
        user.save();
        res.end();
    }).catch((err) => {
        res.status(500).send("Internal Server Error");
    });
});

/**
 * Admin-only route for banning/unbanning a user
 * expected parameter:
 *  A string corresponding to the username of the user you are banning/unbanning
 *  A string, either 'ban' or 'unban'
 */
app.post("/api/admin/change_ban/:username/:ban_status", adminRequestChecker, mongoChecker, (req, res) => {
    const username = req.params.username;
    const ban_status = req.params.ban_status;

    Credential.updateOne({ username: username }, { $set: { is_banned: (ban_status === 'ban') ? true : false } }).then((user) => {
        if (!user) {
            res.status(404).send();
        } else {
            res.end();
        };
    }).catch((err) => {
        if (isMongoError(err)) {
            res.status(500).send("Internal Server Error");
        } else {
            log(err);
        };
    });
});

/**
 * Admin-only route for getting information about an event
 * expected parameter:
 *  A string corresponding to the name of the event you are searching for
 * expected output:
 * {
 *  event: [Object], // RandomEvent
 *  choice_one_establishment: [Object] // Establishment (optional, if applicable)
 *  choice_two_establishment: [Object] // Establishment (optional, if applicable)
 * }
 */
app.get("/api/admin/search_event/:event_name", adminRequestChecker, mongoChecker, async(req, res) => {
    const event_name = req.params.event_name;
    const event_data = {};

    try {
        const event = await RandomEvent.findByName(event_name);

        if (!event) {
            res.status(404).end();
            return;
        }

        event_data.event = event;

        if (event.choiceOne.newEstablishment) {
            const establishment = await EstablishmentInfo.findByName(event.choiceOne.newEstablishment);

            if (!event) {
                res.status(404).end();
            } else {
                event_data.choice_one_establishment = establishment;
            }
        }

        if (event.choiceTwo.newEstablishment) {
            const establishment = await EstablishmentInfo.findByName(event.choiceTwo.newEstablishment);

            if (!event) {
                res.status(404).end();
            } else {
                event_data.choice_two_establishment = establishment;
            }
        }

        res.send(event_data);
    } catch (err) {
        if (isMongoError(err)) {
            res.status(500).send("Internal Server Error");
        } else {
            log(err);
        };
    }
});

/**
 * Admin-only route for saving a new event
 * expected data:
 * {
 *  event-name: String, // Name of the event
 *  event-description: String,  // Description for the event
 *  choice-one-description: String, // Description for the first choice
 *  choice-one-econ: Number,    // Economy statistic change for the first choice
 *  choice-one-order: Number,   // Order statistic change for the first choice
 *  choice-one-health: Number,  // Health statistic change for the first choice
 *  choice-one-diplomacy: Number,   // Diplomacy statistic change for the first choice
 *  choice-one-log-content: String, // Log content the first choice
 *  choice-one-establishment-name: String,  // Optional; name for the establishment of the first choice
 *  choice-one-establishment-description: String,   // Optional; description for the establishment of the first choice
 *  choice-one-establishment-econ: Number,  // Optional; economy statistic change for the establishment of the first choice
 *  choice-one-establishment-order: Number, // Optional; order statistic change for the establishment of the first choice
 *  choice-one-establishment-health: Number,    // Optional; health statistic change for the establishment of the first choice
 *  choice-one-establishment-diplomacy: Number, // Optional; diplomacy statistic change for the establishment of the first choice
 *  choice-two-description: String  // Description for the second choice
 *  choice-two-econ: Number,    // Economy statistic change for the second choice
 *  choice-two-order: Number,   // Order statistic change for the second choice
 *  choice-two-health: Number,  // Health statistic change for the second choice
 *  choice-two-diplomacy: Number,   // Diplomacy statistic change for the second choice
 *  choice-two-log-content: String, // Log content for the second choice
 *  choice-two-establishment-name: String,  // Optional; name for the establishment of the first choice
 *  choice-two-establishment-description: String,   // Optional; description for the establishment of the first choice
 *  choice-two-establishment-econ: Number,  // Optional; economy statistic change for the establishment of the first choice
 *  choice-two-establishment-order: Number, // Optional; order statistic change for the establishment of the first choice
 *  choice-two-establishment-health: Number,    // Optional; health statistic change for the establishment of the first choice
 *  choice-two-establishment-diplomacy: Number  // Optional; diplomacy statistic change for the establishment of the first choice
 * }
 */
app.post("/api/admin/create_event", adminRequestChecker, mongoChecker, async(req, res) => {
    try {
        const choice_one_stat_change = new StatChange({
            economy: req.body["choice-one-econ"],
            order: req.body["choice-one-order"],
            health: req.body["choice-one-health"],
            diplomacy: req.body["choice-one-diplomacy"]
        });

        const choice_two_stat_change = new StatChange({
            economy: req.body["choice-two-econ"],
            order: req.body["choice-two-order"],
            health: req.body["choice-two-health"],
            diplomacy: req.body["choice-two-diplomacy"]
        });

        const event = new RandomEvent({
            name: req.body["event-name"],
            description: req.body["event-description"],
            choiceOne: new EventChoice({
                description: req.body["choice-one-description"],
                statChange: choice_one_stat_change,
                log: new Log({
                    content: req.body["choice-one-log-content"],
                    statChange: choice_one_stat_change
                })
            }),
            choiceTwo: new EventChoice({
                description: req.body["choice-two-description"],
                statChange: choice_two_stat_change,
                log: new Log({
                    content: req.body["choice-two-log-content"],
                    statChange: choice_two_stat_change
                })
            })
        });

        if (await RandomEvent.findByName(req.body["event-name"])) {
            res.status(400).redirect('/admin_dashboard?event_create=duplicate');
            return;
        }

        if (req.body["choice-one-establishment-toggle"]) {
            const choice_one_establishment = new EstablishmentInfo({
                name: req.body["choice-one-establishment-name"],
                description: req.body["choice-one-establishment-description"],
                statChange: new StatChange({
                    economy: req.body["choice-one-establishment-econ"],
                    order: req.body["choice-one-establishment-order"],
                    health: req.body["choice-one-establishment-health"],
                    diplomacy: req.body["choice-one-establishment-diplomacy"]
                })
            });

            event.choiceOne.newEstablishment = req.body["choice-one-establishment-name"];

            if (!(await EstablishmentInfo.findByName(req.body["choice-one-establishment-name"]))) {
                await choice_one_establishment.save();
            }
        }

        if (req.body["choice-two-establishment-toggle"]) {
            const choice_two_establishment = new EstablishmentInfo({
                name: req.body["choice-two-establishment-name"],
                description: req.body["choice-two-establishment-description"],
                statChange: new StatChange({
                    economy: req.body["choice-two-establishment-econ"],
                    order: req.body["choice-two-establishment-order"],
                    health: req.body["choice-two-establishment-health"],
                    diplomacy: req.body["choice-two-establishment-diplomacy"]
                })
            });

            event.choiceTwo.newEstablishment = req.body["choice-two-establishment-name"];

            if (!(await EstablishmentInfo.findByName(req.body["choice-two-establishment-name"]))) {
                await choice_two_establishment.save();
            }
        }

        await event.save();
        res.redirect("/admin_dashboard?event_create=success");
    } catch (err) {
        console.log(err);
        res.status(500).redirect("/admin_dashboard?event_create=failed");
    }
});


/**
 * Route for user to submit a feedback
 * expected body:
 * {
 *  content: String
 * }
 */
app.post("/api/user/feedback", mongoChecker, async(req, res) => {
    const username = req.session.username;
    const content = req.body.content;
    const feedback = new Feedback({
        "sender": username,
        "content": content
    })
    feedback.save().then(feedback => {
        if (!feedback) {
            res.status(400).send();
        } else {
            res.status(200).send();
        }
    }).catch(err => {
        log(err);
        res.status(500).send();
    })
});

/**
 * Route for admin getting array containing all feedbacks
 * expected output:
 * {
 *  feedbacks:[Object]  // should contain Feedback models
 * }
 */
app.get("/api/admin/feedback", adminRequestChecker, mongoChecker, async(req, res) => {
    try {
        const user_feedback = await Feedback.find();
        res.send(user_feedback);
    } catch (err) {
        log(err);
        res.status(500).end();
    }
});

/**
 * Route for admin to delete a specific user feeback
 * expected parameter:
 *  A string corresponding to the id of the Feeback document you are deleting
 */
app.delete("/api/admin/feedback/:id", adminRequestChecker, mongoChecker, async(req, res) => {
    const id = req.params.id;

    try {
        const deleted_user_feedback = await Feedback.findOneAndRemove({
            _id: id
        });

        if (deleted_user_feedback) {
            res.send();
        } else {
            res.status(404).redirect("/user_feedback?delete=failed");
        }
    } catch (err) {
        log(err);
        res.status(500).redirect("/user_feedback?delete=failed");
    }
});

// Root route: redirects to the '/welcome'
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/welcome');
});

// '/welcome' route: reirects to '/admin_dashboard' if the user is logged in and is an admin user; redirects to '/gameplay' if the user is already logged in but isn't an admin user
app.get('/welcome', adminRedirectChecker, sessionChecker, (req, res) => {
    const invalid = req.query.invalid;

    switch (invalid) {
        case 'banned':
            res.render('home_login', {
                banned: true
            });
            break;
        case 'credentials':
            res.render('home_login', {
                invalid_credentials: true
            });
            break;
        default:
            res.render('home_login');
    }
});

// '/gameplay' route: redirects to '/welcome' if the user isn't logged in; redirects to '/admin_dashboard' if the user is an admin user
app.get('/gameplay', loggedOutRedirectChecker, adminRedirectChecker, (req, res) => {
    res.render('gameplay');
});

// '/diplomacy' route: redirects to '/welcome' if the user isn't logged in; redirects to '/admin_dashboard' if the user is an admin user
app.get('/diplomacy', loggedOutRedirectChecker, adminRedirectChecker, (req, res) => {
    res.render('diplomacy');
});

// '/contact' route: redirects to '/welcome' if the user isn't logged in; redirects to '/admin_dashboard' if the user is an admin user
app.get('/contact', loggedOutRedirectChecker, adminRedirectChecker, (req, res) => {
    res.render('contact');
});

// '/leaderboard' route: if the user isn't logged in, the header will only display links to the the patchnotes and the leaderboard (excluding the other links)
app.get('/leaderboard', adminRedirectChecker, (req, res) => {
    if (req.session.user) {
        res.render('leaderboard');
    } else {
        res.render('leaderboard', {
            is_logged_out: true
        });
    }
});

/**
 * '/patchnotes' route
 * If the user is an admin user - the header will display admin specific links only
 * If the user isn't logged in - the header will only display links to the the patchnotes and the leaderboard (excluding the other links)
 */
app.get('/patchnotes', (req, res) => {
    if (req.session.is_admin) {
        res.render('patchnote', {
            is_admin: true
        });
    } else if (req.session.user) {
        res.render('patchnote');
    } else {
        res.render('patchnote', {
            is_logged_out: true
        });
    }
});

// '/admin_dashboard' route: redirects to '/welcome' if the user isn't logged in; redirects to '/gameplay' if the user isn't an admin user
app.get('/admin_dashboard', loggedOutRedirectChecker, regUserRedirectChecker, (req, res) => {
    res.render('admin_dashboard');
});

// '/user_feedback' route: redirects to '/welcome' if the user isn't logged in; redirects to '/gameplay' if the user isn't an admin user
app.get('/user_feedback', loggedOutRedirectChecker, regUserRedirectChecker, (req, res) => {
    res.render('user_feedback');
});

// '/user_profile' route: redirects to '/login' if the user isn't logged in; redirects to '/admin_dashboard' if the user is an admin user
app.get('/user_profile', loggedOutRedirectChecker, adminRedirectChecker, async(req, res) => {
    try {
        const profile = req.query.profile;
        const upload = req.query.upload;
        const country_name = req.query.country_name;

        if (profile !== undefined && profile !== req.session.username) {
            const user = await Profile.findByUsername(profile);

            if (user) {
                res.render('user_profile', {
                    visiting: true,
                    uploadStatus: upload,
                    countryNameStatus: country_name
                });
            } else {
                res.render('user_profile', {
                    not_found: true
                });
            }
        } else {
            res.render('user_profile');
        }
    } catch {

    }
});

// Set up the routes for the '/css', '/images/, and '/js' static directories
app.use("/css", express.static(path.join(__dirname, '/public/css')));
app.use("/images", express.static(path.join(__dirname, '/public/images')));
app.use("/js", express.static(path.join(__dirname, '/public/js')));

// Any other page isn't valid and will automatically redirect to '/' (which will then automatically redirect to '/gameplay' if the user is logged in or '/welcome' if the user isn't)
app.get('*', (req, res) => {
    res.redirect('/');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    log(`listening on ${port}...`);
});