const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyparser = require('body-parser')
require('dotenv').config();
const compression = require('compression');
const router = express.Router();
const rootRouter = require('./src/routes/index.js')(router);
const socialAuth = require('./src/routes/socialAuth')(router);
const cors = require('cors');
// const dbConfiguration = require('./bin/config/db');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('./src/auth/google');
const { LinkedinSignup, LinkedinSignin } = require('./src/auth/linkedin');
/**
 * Middlewares go here for the application.
 * if it gets to cumbersome then we can move to seperate file
 * if it gets to cumbersome then we can move to seperate file
 * 
 */

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Register Google Passport strategy
passport.use(GoogleStrategy);

// Signup Linkedin Passport strategy
passport.use(LinkedinSignup);

// Signin Linkedin Passport strategy
passport.use(LinkedinSignin);

// serialize and deserialize
passport.serializeUser(function (user, done) {
  console.log('serializing user: ', user._id)
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  console.log('deserializing user: ', id)
  User.findById(id, function (err, user) {
    if (err) done(err, null);
    if (!user) done(null, { user: null })
    else {
      done(null, user);
    }
  });
});



app.use(compression());
app.use(morgan('dev'));
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.json());//for parsing application/json
app.use(express.urlencoded({ extended: false })); //for parsing application/x-www-form-urlencoded
app.use(cors());
app.use('/api', rootRouter);
app.use('/', socialAuth);


app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
})
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  })
})
// dbConfiguration()

app.all('*', (req, res) => res.status(200).send({ message: 'server is live' }));

module.exports = app;