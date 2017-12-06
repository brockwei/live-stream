//passport.js
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();

const sequelize = require('sequelize');
const bcrypt = require('./bcrypt');

const Model = require('../models')
const User = Model.user
// const Email = Model.user.email
// const FacebookID = Model.user.facebookID
// const FacebookDisplayName = Model.user.facebookDisplayName
// const GoogleID = Model.user.googleID
// const GoogleDisplayName = Model.user.googleDisplayName

module.exports = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());

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
          console.log(user.get({
            plain: true
          }))
          // user.email = user.profile.
          if (created) {
            user.facebookID = profile.id
            user.facebookDisplayName = profile.displayName
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
    callbackURL: 'http://localhost:8080/auth/google/redirect',
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
    (email, password, done) => {
      Model.user.findOne({
        where: {
          'email': email
        }
      }).then((user) => {
        if (user == null) {
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
    (email, password, done) => {
      Model.user.findOne({
        where: {
          'email': email
        }
      }).then((user) => {
        if (user) {
          return done(null, false, { message: 'Email already taken' });
        } else {
          bcrypt.hashPassword(password)
            .then(hash => {
              const newUser = {
                email: email,
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