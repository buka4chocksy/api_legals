const express = require('express');
const app = express();
const os = require("os");
const morgan = require('morgan');
const bodyparser = require('body-parser')
//const redis = require('ioredis')

//let redisclient = new redis("")

require('dotenv').config();
const compression = require('compression');
const router = express.Router();
const rootRouter = require('./src/routes/index.js')(router);
const socialAuth = require('./src/routes/socialAuth')(router);
const cors = require('cors');
// const dbConfiguration = require('./bin/config/db');
const passport = require('passport');
const session = require('express-session');
const { GoogleStrategySignup, GoogleStrategySignin } = require('./src/auth/google');
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
passport.use("google-signup", GoogleStrategySignup);

// Signin Google Passport strategy
passport.use("google-signin", GoogleStrategySignin)

// Signin Linkedin Passport strategy
passport.use("signin", LinkedinSignin);

// Signup Linkedin Passport strategy
passport.use("signup", LinkedinSignup);

// serialize and deserialize
passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user){
        if(!err) done(null, user);
        else done(err, null);
      });
});

app.use(express.static("public"));
app.use(compression());
app.use(morgan('dev'));
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(express.json()); //for parsing application/json
app.use(express.urlencoded({ extended: false})); //for parsing application/x-www-form-urlencoded
app.use(cors());

app.use('/api', rootRouter);
app.use('/', socialAuth);

app.get("/lawyer", (req, res) => {
  return res.sendFile(__dirname + "/public/lawyer.html");
})

app.get("/client", (req, res) => {
  return res.sendFile(__dirname + "/public/client.html");
})

// app.use((req, res, next) => {
//   const error = new Error('Not found');
//   error.status = 404;
//   next(error);
// })

app.use((error, req, res, next) => {
  console.log("in here for general error", error)
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