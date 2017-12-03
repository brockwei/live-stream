//passport.js
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config();

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
  
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL,
        profileFields: ['email','name']
      },
      function(accessToken, refreshToken, profile, cb) {
        return cb(null,{profile:profile,accessToken:accessToken});
      }
    ));
    /*Understanding serializeUser & deserializeUser:
    https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
    */
    passport.serializeUser((user,done)=>{
      done(null,user);
    });
    passport.deserializeUser((user,done)=>{
      done(null,user);
    });
};