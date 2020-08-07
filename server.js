'use strict';
const log = console.log;

// Express
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Mongo and Mongoose
const { mongoose } = require('./db/mongoose');
const { ObjectID } = require('mongodb');
mongoose.set('bufferCommands', false);
mongoose.set('useFindAndModify', false);

// Import our models
const { Credential } = require("./models/UserCredential");
const { EstablishmentInfo, RandomEvent } = require("./models/SystemData");
const { UserGameplay } = require("./models/UserGameplay");
const { Profile } = require("./models/UserProfile");

// express-session for managing user sessions
const session = require('express-session')
app.use(bodyParser.urlencoded({ extended: true }));

// handlebars server-side templating engine
const exphbs = require('express-handlebars');
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
app.post("/api/register", mongoChecker, (req, res) => {
    // Create a Credential model instance for the user's inputted username, email, password, and birthday
    const credentials = new Credential({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        birthday: req.body.birthday
    });

    // Save the user credentials to the the database
    credentials.save().then(user => {
        // Set the session data accordingly
        req.session.user = user._id;
        req.session.username = user.username;
        req.session.email = user.email;
        req.session.is_admin = user.is_admin;

        // Generate default gameplay data for user
        const gameplayData = new UserGameplay({
            username: user.username,
            statistic: {
                economy: 50,
                order: 50,
                health: 50,
                diplomacy: 50
            },
            establishment: [],
            log: [],
            stategy: {}
        });
        gameplayData.save().then((data) => {
            if (!data) {
                res.status(500).send("500 Internal Server Error");
            } else {
                // Redirect the (now logged-in) user to the gameplay page ('/gameplay' page)
                res.redirect('/gameplay');
            }
        }).catch((err) => {
            if (isMongoError(err)) {
                res.status(500).redirect('/welcome');
            } else {
                res.status(400).redirect('/welcome');
            }
        });

    }).catch((err) => {
        if (isMongoError(err)) {
            res.status(500).redirect('/welcome');
        } else {
            res.status(400).redirect('/welcome');
        }
    })
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
            res.redirect('/welcome');
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
app.get("/api/user/gameplay:type", mongoChecker, (req, res) => {
    const username = req.session.username;
    const reqType = req.body.type;

    UserGameplay.findByUsername(username).then((user) => {
        if (!user) {
            // Either client's cookie is corrupted or user has been deleted by admin
            // Logging the user out should be appropriate
            res.redirect("/api/logout");
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
                    res.send(user.statistic);
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
            res.status(500).send("Internal Server Error");
        } else {
            log(err);
            // Either client's cookie is corrupted or user has been deleted by admin
            // Logging the user out should be appropriate
            res.redirect("/api/logout");
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
app.get("/api/user/gameplay/EstInfo", mongoChecker, (req, res) => {
    const establishmentName = req.body.name;

    EstablishmentInfo.findByName(establishmentName).then((establishment) => {
        if (!establishment) {
            // Something is desync in the client or server side, log the user out and make them reload the page
            res.redirect("/logout");
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
            res.status(500).send("Internal Server Error");
        } else {
            log(err);
            // Something is desync in the client or server side, log the user out and make them reload the page
            res.redirect("/api/logout");
        };
    });
});

/**
 * Route for changing user's strategy
 * expected request body: none
 * expected return value: boolean indicating if the change was successful
 * 
 * parameters
 * strategyType: which strategy is being change(economy/order/health/diplomacy)
 * value: the new choice of strategy for that field
 */
app.post("/api/user/gameplay:strategyType:value", mongoChecker, (req, res) => {
    const type = req.body.strategyType;
    const value = req.body.value;
    const username = req.session.username;

    UserGameplay.findByUsername(username).then((user) => {
        if (!user) {
            // Either client's cookie is corrupted or user has been deleted by admin
            // Logging the user out should be appropriate
            res.redirect("/api/logout");
        } else {
            // apply the change of strategy
            switch (type) {
                case "economy":
                    user.strategy.economy = value;
                    break;
                case "order":
                    user.strategy.order = value;
                    break;
                case "health":
                    user.strategy.health = value;
                    break;
                case "diplomacy":
                    user.strategy.diplomacy = value;
                    break;
                default:
                    user.strategy.economy = value;
                    break;
            };

            // save document
            user.save((err, user) => {
                if (err) {
                    log(err);
                    res.send(false);
                } else {
                    res.send(true);
                }
            });
        };
    }).catch((err) => {
        if (isMongoError(err)) {
            res.status(500).send("Internal Server Error");
        } else {
            log(err);
            // Something is desync in the client or server side, log the user out and make them reload the page
            res.redirect("/api/logout");
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
 *  log: Object  (see logSchema in /models/UserGameplay)
 *  newStatistics: [Number]
 * }
 */
app.post("/api/user/gameplay/event", mongoChecker, (req, res) => {
    const username = req.session.username;
    const eventName = req.body.eventName;
    const choice = req.body.choice;

    UserGameplay.findByUsername(username).then((user) => {
        if (!user) {
            // Either client's cookie is corrupted or user has been deleted by admin
            // Logging the user out should be appropriate
            res.redirect("/api/logout");
        } else {
            // TODO: implement following

            // find the event document from database
            const evt = await RandomEvent.findByName(eventName);
            if (!evt) {
                res.status(500).send();
                return;
            }
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
            user.statistic.order += choiceDoc.statChange.order;
            user.statistic.health += choiceDoc.statChange.health;
            user.statistic.diplomacy += choiceDoc.statChange.diplomacy;
            output.newStatistic = user.statistic.convertToArray();

            // generate log (should be preset in EventChoice document)
            output.log = choiceDoc.log;

            // Save the new statistic, log, and establishment(if any) in user
            if (choiceDoc.newEstablishment) {
                user.establishment.push({ name = choiceDoc.newEstablishment.name });
                output.establishment = choiceDoc.newEstablishment.name;
            } else {
                output.establishment = null;
            }

            user.save().then((user) => {
                if (!user) {
                    res.status(500).send("500 Internal Server Error");
                } else {
                    // Send the expected return value to client
                    res.send(output);
                }
            }).catch((err) => {
                // server error can't save
                res.status(500).send("Internal Server Error");
            });
        }
    }).catch((err) => {
        if (isMongoError(err)) {
            res.status(500).send("Internal Server Error");
        } else {
            log(err);
            // Something is desync in the client or server side, log the user out and make them reload the page
            res.redirect("/api/logout");
        };
    });
});

/**
 * Route for requesting an update
 * Expected request body: none
 * Expected return value:
 * {
 * new stat:[Number],
 * log: Object  (see logSchema in /models/UserGameplay)
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

    UserGameplay.findByUsername(username).then((user) => {
        if (!user) {
            // Either client's cookie is corrupted or user has been deleted by admin
            // Logging the user out should be appropriate
            res.redirect("/api/logout");
        } else {
            // TODO: implement following

            // Calculate new statistics

            // Generate log

            // Change statistics and add log to user document

            // save user document

            // Determine if a random event occurs, and if so, which one

            // Send new statistics, log and randomEvent to user
        };
    }).catch((err) => {
        log(err);
        res.send(false);
    });
});

// Root route: redirects to the '/welcome'
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/welcome');
});

// '/welcome' route: reirects to '/admin_dashboard' if the user is logged in and is an admin user; redirects to '/gameplay' if the user is already logged in but isn't an admin user
app.get('/welcome', adminRedirectChecker, sessionChecker, (req, res) => {
    res.render('home_login');
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
    res.render('userfeedback');
});

// '/user_profile' route: redirects to '/login' if the user isn't logged in; redirects to '/admin_dashboard' if the user is an admin user
app.get('/user_profile', loggedOutRedirectChecker, adminRedirectChecker, (req, res) => {
    res.render('user_profile');
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