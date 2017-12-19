//passport.js
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();

const sequelize = require('sequelize');
const bcrypt = require('./bcrypt');

const Model = require('../models');
const User = Model.user;
// const Email = Model.user.email
// const FacebookID = Model.user.facebookID
// const FacebookDisplayName = Model.user.facebookDisplayName
// const GoogleID = Model.user.googleID
// const GoogleDisplayName = Model.user.googleDisplayName

module.exports = (app) => {

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    profileFields: ['email', 'name']
  },
    function (accessToken, refreshToken, profile, cb) {
      User
        .findOrCreate({
          where: {
            email: profile.emails[0].value
          }
        })
        .spread((user, created) => {
          // console.log(user.get({
          //   plain: true
          // }))
          // user.email = user.profile.
          if (created) {
            user.facebookID = profile.id
            user.facebookDisplayName = profile.name.givenName + ' ' + profile.name.familyName
            //profile.displayName
            user.save()
            console.log('new user is created')
          } else {
            console.log('old user login')
          }
        })

      return cb(null, { profile: profile, accessToken: accessToken });
    }
  ));

  passport.use(new GoogleStrategy({
    // options for google strategy
    clientID: process.env.GOOGLE_clientID,
    clientSecret: process.env.GOOGLE_clientSecret,
    callbackURL: process.env.GOOGLE_callbackURL,
    //'http://localhost:8080/auth/google/redirect',
    scope: 'user:email',

  }, (accessToken, refreshToken, profile, done) => {
    // check if user already exists in our own db
    User
      .findOrCreate({
        where: {
          email: profile.emails[0].value
        }
      })
      .spread((user, created) => {
        if (created) {
          user.googleID = profile.id
          // user.email = profile.emails[0].value
          user.googleDisplayName = profile.displayName
          user.save()
          console.log('new user is created')
        } else {
          console.log('old user login')
        }
      })

    return done(null, { profile: profile, accessToken: accessToken });
  })
  );

  passport.use('local-login', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
      // session: false
    },
    (req, email, password, done) => {

      //use the express-validator to check input items
      req.checkBody('email', 'Email is required.').notEmpty();
      req.checkBody('email', 'Please enter valid email').isEmail();
      // req.checkBody('password', 'Password is required.').notEmpty();
      req.checkBody('password', 'Password length must be between 2-20 letters').isLength({ min: 2, max: 20 });

      var err = req.validationErrors();
      if (err) {
        return done(JSON.stringify(err.msg))
        // return done(JSON.stringify(err), false, { success: false, error: err });
      }

      Model.user.findOne({
        where: {
          'email': email
        }
      }).then((user) => {
        if (user == null) {
          // return done(null, false, req.flash('signupMessage', 'Incorrect credentials.'));

          return done(null, false, { message: 'Incorrect credentials.' });
        }

        bcrypt.checkPassword(password, user.password)
          .then(result => {
            if (result) {
              return done(null, user);
            } else {
              return done(null, false, { message: 'Incorrect credentials' });
            }
          })
          .catch(err => console.log(err));
      });
    }
  ));

  passport.use('local-signup', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
      // session: false
    },
    (req, email, password, done) => {

      // //use the express-validator to check input items
      // req.checkBody('email', 'Email is required.').notEmpty();
      // req.checkBody('email', 'Invalid email format.').isEmail();
      // req.checkBody('password', 'Password is required.').notEmpty();
      // req.checkBody('password', 'The password length must be between 2 and 20.').isLength({ min: 2, max: 20 });
      // req.checkBody('displayname', 'Display Name is required').notEmpty();
      // req.checkBody('displayname', 'Display Name must be between 2 and 100').isLength({ min: 2, max: 100 })

      // var err = req.validationErrors();
      // if (err) {
      //   return done(JSON.stringify(err))
      //   // return done(err, false, { success: false, error: err });
      // }

      Model.user.findOne({
        where: {
          'email': email
        }
      }).then((user) => {
        console.log(req.body);
        if (user) {
          return done(null, false, { message: 'Email already taken' });
        } else {
          bcrypt.hashPassword(password)
            .then(hash => {
              const newUser = {
                email: email,
                username: req.body.displayname,
                password: hash
              };

              Model.user.create(newUser).then((newUser) => {
                console.log('newUser ' + newUser)
                done(null, newUser);

              });
            })
            .catch(err => console.log(err));
        }
      });
    }
  ));

  /*Understanding serializeUser & deserializeUser:
  https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
  */
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};