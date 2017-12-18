const passport = require('passport');

/* Database */
const sequelize = require('sequelize');
const Model = require('../models');
const User = Model.user;

module.exports = (express) => {
    const router = express.Router();
    /* Middleware */
    // Checks if logged in, otherwise redirect to login page
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }
    // Checks if not already logged in, otherwise redirect from login page to chatroom
    function isNotLoggedIn(req,res,next){
        // console.log('test');
        if(!req.isAuthenticated()){
            // console.log(req.isAuthenticated());
            return next();
        }
        res.redirect('/test');
    }
    // Login Page
    router.get('/', isNotLoggedIn, (req, res) => {
        // console.log('test');
        res.sendFile(__dirname + '/loginB.html');
    });
    router.get('/login2', (req, res) => {
        res.sendFile(__dirname + '/login2.html');
    });
    // Secret Path to be protected
    router.get('/test', isLoggedIn, (req, res) => {
        res.sendFile(__dirname + '/test.html');
    });
    router.get('/test/:room', isLoggedIn, (req, res) => {
        req.session.room = req.params.room;
        // console.log(req.session.room);
        res.sendFile(__dirname + '/test.html');
    });

    // Facebook OAuthentication
    router.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['user_friends', 'manage_pages', 'email']
    }));
    // The Redirect URL route.
    router.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/'
    }), (req, res) => {
        User.findAll({where: {"email":req.user.profile._json.email}}).then(user=>{
            // let name = req.user.profile.name.givenName;
            // req.session.name = name;
            // req.session.email = req.user.profile._json.email;
            req.session.userData = {
                username: req.user.profile._json.email,
                email: req.user.profile._json.email
            }
            res.redirect('/test');
        });
    });
    // Google+ OAuthentication
    router.get('/auth/google', passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

    // callback route for google to redirect to hand control to passport to use code to grab profile info
    router.get('/auth/google/redirect', passport.authenticate('google', {
        failureRedirect: '/'
    }), (req, res) => {
        // console.log('google router');
        // console.log(req.user);
        res.redirect('/test');
        // console.log('google router'+req.user);
        // console.log(req.user)        
    });

    //Local Authentication - Login
    router.post('/locallogin', passport.authenticate('local-login', {
        // successRedirect: '/test',
        failureRedirect: '/',
        failureFlash: true
    }), (req, res) => {
        // req.session.userData = {
        //     username: req.user.dataValues.username,
        //     email: req.session.email = req.user.dataValues.email
        // }
        //Save Username and email in sessions
        req.session.userData = {
            username: req.user.dataValues.username,
            email: req.user.dataValues.email
        }
        // console.log(req.user.dataValues);
        res.redirect('/test');
    });

    //Local Authentication - Sign Up
    router.post('/signup', passport.authenticate('local-signup', {
        // successRedirect: '/test',
        failureRedirect: '/',
        failureFlash: true
    }), (req, res) => {
        //Save Username and email in sessions
        req.session.userData = {
            username: req.user.dataValues.username,
            email: req.user.dataValues.email
        }
        // console.log(req.user.dataValues);
        res.redirect('/test');
    });

    router.get('/error', (req, res) => {
        res.send('You are not logged in!');
    });

    // router.get('/logout', (req, res) => {
    //     req.logout();
    //     res.redirect("/")
    // });

    router.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            console.log("logouted")
            if (err) { console.log(err) }
            res.redirect('/'); //Inside a callback… bulletproof!
        })
    });
    return router;
}