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
const hbs = exphbs.create({
    defaultLayout: null,
    extname: '.html'
});
app.engine('.html', hbs.engine);
app.set('view engine', '.html');
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

const sessionChecker = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/gameplay');
    } else {
        next();
    }
};

const loggedOutChecker = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
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
 *  {
 *      username: <username>
 *      password: <password>
 *      email: <an email address containing @>
 *      birthday: <a string in the format YYYY-MM-DD>
 *  }
 */
app.post("/api/register", mongoChecker, (req, res) => {
    const credentials = new Credential({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        birthday: req.body.birthday
    });

    credentials.save().then(user => {
        req.session.user = user._id;
        req.session.username = user.username;
        req.session.email = user.email;
        res.redirect('/gameplay');
    }).catch((err) => {
        if (isMongoError(err)) {
            res.status(500).redirect('/welcome');
        } else {
            res.status(400).redirect('/welcome');
        }
    })
});

// Login Route
app.post("/api/login", mongoChecker, (req, res) => {
	const username = req.body.username
    const password = req.body.password

    Credential.findByUsernamePassword(username, password).then((user) => {
        if (!user) {
            res.redirect('/welcome');
        } else {
            req.session.user = user._id;
            req.session.username = user.username;
            req.session.email = user.email;
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

app.post("/api/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.redirect('/');
        }
    });
});

// Root route: redirects to the '/welcome'
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/welcome');
});

app.get('/welcome', sessionChecker, (req, res) => {
	res.render('home_login');
});

app.get('/gameplay', loggedOutChecker, (req, res) => {
    res.render('gameplay');
});

app.get('/diplomacy', loggedOutChecker, (req, res) => {
    res.render('diplomacy');
});

app.get('/contact', loggedOutChecker, (req, res) => {
    res.render('contact');
});

app.get('/leaderboard', (req, res) => {
    if (req.session.user) {
        res.render('leaderboard');
    } else {
        res.render('leaderboard', {
            login: true
        });
    }
});

app.get('/patchnotes', (req, res) => {
    if (req.session.user) {
        res.render('patchnote');
    } else {
        res.render('patchnote', {
            login: true
        });
    }
});

app.get('/user_profile', loggedOutChecker, (req, res) => {
    res.render('user_profile');
});

app.use("/css", express.static(path.join(__dirname, '/public/css')));
app.use("/images", express.static(path.join(__dirname, '/public/images')));
app.use("/js", express.static(path.join(__dirname, '/public/js')));

app.get('*', (req, res) => {
    res.redirect('/');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    log(`listening on ${port}...`);
});