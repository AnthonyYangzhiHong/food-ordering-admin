const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var crypto = require('crypto');
const UserSchema = require('./models/User');
const session = require('express-session');
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


//Routs
app.get('/login', (req, res, next) => {

    const form = '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';
    res.send(form);
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

app.get('/api/greeting', (req, res) => {
  const name = req.query.name || 'World';

  res.json({ greeting: `Hello ${name}!` })
});

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