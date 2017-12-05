//passport.js
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();

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
    // User.findOrCreate(profile, done)
    return done(null, { profile: profile, accessToken: accessToken });

  })
  );
  passport.use('local-login', new LocalStrategy(
    (email, password, done) => {
      Model.User.findOne({
        where: {
          'email': email
        }
      }).then((user) => {
        if (user == null) {
          return done(null, false, { message: 'Incorrect credentials.' });
        }

        if (user.password === password) {
          return done(null, user);
        }

        return done(null, false, { message: 'Incorrect credentials.' });
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