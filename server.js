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

// Middleware for checking if user is currently logged out in order to redirect them to the gameplay page ('/gameplay' route) if necessary
const sessionChecker = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/gameplay');
    } else {
        next();
    }
};

// Middleware for checking if user is currently logged out in order to redirect them to the login/register page ('/welcome' route) if necessary 
const loggedOutChecker = (req, res, next) => {
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
        // Redirect the (now logged-in) user to the gameplay page ('/gameplay' page)
        res.redirect('/gameplay');
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
	const username = req.body.username
    const password = req.body.password

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
             // ...and redirect the (now logged-in) user to the gameplay page ('/gameplay' page)
            res.redirect('/gameplay');
        }
    }).catch((err) => {
        if (isMongoError(err)) {
            res.status(500).redirect('/welcome');
        } else {
            log(err);
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

// Root route: redirects to the '/welcome'
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/welcome');
});

// '/welcome' route: redirects to '/gameplay' if the user is already logged in
app.get('/welcome', sessionChecker, (req, res) => {
	res.render('home_login');
});

// '/gameplay' route: redirects to '/login' if the user isn't logged in
app.get('/gameplay', loggedOutChecker, (req, res) => {
    res.render('gameplay');
});

// '/diplomacy' route: redirects to '/login' if the user isn't logged in
app.get('/diplomacy', loggedOutChecker, (req, res) => {
    res.render('diplomacy');
});

// '/contact' route: redirects to '/login' if the user isn't logged in
app.get('/contact', loggedOutChecker, (req, res) => {
    res.render('contact');
});

// '/leaderboard' route: if the user isn't logged in, the header will only display links to the the patchnotes and the leaderboard (excluding the other links)
app.get('/leaderboard', (req, res) => {
    if (req.session.user) {
        res.render('leaderboard');
    } else {
        res.render('leaderboard', {
            login: true
        });
    }
});

// '/patchnotes' route: if the user isn't logged in, the header will only display links to the the patchnotes and the leaderboard (excluding the other links)
app.get('/patchnotes', (req, res) => {
    if (req.session.user) {
        res.render('patchnote');
    } else {
        res.render('patchnote', {
            login: true
        });
    }
});

// '/user_profile' route: redirects to '/login' if the user isn't logged in
app.get('/user_profile', loggedOutChecker, (req, res) => {
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