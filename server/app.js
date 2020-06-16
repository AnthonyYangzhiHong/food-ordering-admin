const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var crypto = require('crypto');
const UserSchema = require('./models/User');
const session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo')(session);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Connect Mongoose with mongoDB
const db = require('./config/keys').mongoURI;

const connection = mongoose.createConnection(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const User = connection.model('User', UserSchema);

//Setup Session middleware
const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions' })
app.use(session({
    //secret: process.env.SECRET,
    secret: 'some secret',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 30
    }
}));

passport.use(new LocalStrategy(
    function(username, password, cb) {
        User.findOne({ username: username })
            .then((user) => {
                if (!user) { return cb(null, false) }
                
                // Function defined at bottom of app.js
                const isValid = validPassword(password, user.hash, user.salt);
                
                if (isValid) {
                    return cb(null, user);
                } else {
                    return cb(null, false);
                }
            })
            .catch((err) => {   
                cb(err);
            });
}));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    User.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

app.use(passport.initialize());
app.use(passport.session());


//Routs
app.get('/login', (req, res, next) => {

    const form = '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';
    res.send(form);
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: 'login-success' }), (err, req, res, next) => {
    if (err) next(err);
});

app.get('/register', (req, res, next) => {
    const form = '<h1>Register Page</h1><form method="post" action="register">\
                    Enter Username:<br><input type="text" name="username">\
                    <br>Enter Password:<br><input type="password" name="password">\
                    <br><br><input type="submit" value="Submit"></form>';
    res.send(form);
    
});

app.post('/register', (req, res, next) => {
    
    const saltHash = genPassword(req.body.password);
    
    const salt = saltHash.salt;
    const hash = saltHash.hash;
    const newUser = new User({
        username: req.body.username,
        hash: hash,
        salt: salt
    });
    newUser.save()
        .then((user) => {
            console.log(user);
        });
    res.redirect('/login');
});

app.get('/login-success', checkAuthenticated, (req, res, next) => {
    console.log(req.session);
    const form = '<h1>click button to logout</h1><form method="get" action="logout"><input type="submit" value="Logout"></input></form>'
    res.send(form);
});

app.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login')
})

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';

  res.json({ greeting: `Hello ${name}!` })
});

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
        next()
    } else {
        res.redirect('/login')
    }
}

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);


//Helper functions
function genPassword(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    var genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };
}

function validPassword(password, hash, salt) {
    var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}