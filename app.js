//jshint esversion:6
require('dotenv').config()
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true,  useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

 const userSchema = new mongoose.Schema({
   username: String,
   password: String
 });

userSchema.plugin(passportLocalMongoose);

// console.log(process.env.SECRET);
 // userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });


 const User = mongoose.model('User', userSchema);

 passport.use(User.createStrategy());

 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
  res.render("home");
})

app.get('/login', (req, res) => {
  res.render("login");
})

app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect('/secrets');
      });
    }
  })

  // const email = req.body.username;
  // // const password = md5(req.body.password);
  // const password = req.body.password;
  //
  // User.findOne({email: email}, (err, foundUser) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     if (foundUser) {
  //       // if (foundUser.password === password) {
  //       bcrypt.compare(password, foundUser.password, function(err, result) {
  //         if (result === true){
  //           res.render("secrets");
  //         }
  //       })
  //
  //       // }
  //     }
  //   }
  // })
})

app.get('/register', (req, res) => {
  res.render("register");
})

app.get('/secrets', (req, res) => {
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
})

app.post('/register', (req, res) => {
  console.log(req.body);

  User.register({ username: req.body.username}, req.body.password, function(err, user){
      if (err){
        console.log(err);
        res.redirect('/register');
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect('/secrets');
        });
      }
    });
  });

  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //
  //   const email = req.body.username;
  //   // const password = md5(req.body.password);
  //   const password = hash;
  //
  //   const newUser = new User({email: email, password: password});
  //   newUser.save((err) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       res.render("secrets");
  //     }
  //   });
  //
  // });

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect("/");
  })


app.listen(3000, function(){
  console.log("Listening on port 3000");
});
