//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session')
const mongoose = require('mongoose')
const ejs = require('ejs');
require('dotenv').config()
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')


const port = 3000;
const app = express();

app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb+srv://amohajerani6:" + process.env.dbPassword + "@cluster0.piaytyc.mongodb.net/secrets")
var userSchema = new mongoose.Schema({
  username: String,
  password: String
  // whatever else
});

userSchema.plugin(passportLocalMongoose)

User = mongoose.model('account', userSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res) {
  res.render('home')
})

app.get('/register', function(req, res) {
  res.render('register')
})

app.get('/login', function(req, res) {
  res.render('login')
})

app.get('/secrets', function(req, res) {
  if (req.isAuthenticated()) {
    res.render('secrets')
  } else {
    res.redirect('/login')
  }
})

app.post('/register', function(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      res.redirect('/register')
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/secrets')
      })
    }
  })
})

app.post('/login', function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  })
  req.login(user, function(err) {
    if (err) {
      console.log(err)
    } else {
      passport.authenticate('local')(req, res, function() {
        res.redirect('/secrets')
      })
    }
  })
})

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      console.log(err)
    } else {
      res.redirect('/')
    }
  })
})


app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
