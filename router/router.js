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
    function isNotLoggedIn(req, res, next) {
        // console.log('test');
        if (!req.isAuthenticated()) {
            // console.log(req.isAuthenticated());
            return next();
        }
        res.redirect('/test');
    }
    // Login Page
    router.get('/', (req, res) => {
        // console.log('test');
        var a = req.session.invalidUserMessage
        // var a = req.flash('invalidUserMessage')
        // var b = req.flash('invalidPasswordMessage')
        var b = req.session.invalidPasswordMessage
        res.render('login', { invalidUserMessage: a, invalidPasswordMessage: b })
        // res.sendFile(__dirname + '/login2.html');

    });

    // Signup Page
    router.get('/signup', (req, res) => {
        var c = req.session.repeatedEmail
        res.render('signup', { repeatedEmail: c })
        // res.sendFile(__dirname + '/login2.html');
    });
    
    // router.get('/login2', (req, res) => {
    //     res.sendFile(__dirname + '/login2.html');
    // });
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
        User.findAll({ where: { "email": req.user.profile._json.email } }).then(user => {
            // let name = req.user.profile.name.givenName;
            // req.session.name = name;
            // req.session.email = req.user.profile._json.email;
            if(user[0]){
                req.session.userData = {
                    username: user[0].dataValues.username,
                    email: user[0].dataValues.email
                }
            }
            else {
                req.session.userData = {
                    username: null,
                    email: req.user.profile._json.email
                }
            }
            console.log(req.session.userData);
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
        // res.redirect('/test');
        // console.log('google router'+req.user);
        // console.log(req.user)     
        User.findAll({ where: { "email": req.user.profile.emails[0].value } }).then(user => {
            if(user[0]){
                req.session.userData = {
                    username: user[0].dataValues.username,
                    email: user[0].dataValues.email
                }
            }
            else {
                req.session.userData = {
                    username: null,
                    email: req.user.profile.emails[0].value
                }
            }
            res.redirect('/test');
        });   
    });

    // router.post('/locallogin',
    //     passport.authenticate('local-login',
    //         // { session: false },
    //         {
    //             successRedirect: '/test',
    //             failureRedirect: '/',
    //             failureFlash: true
    //         })
    // )

    router.post('/locallogin', function (req, res, next) {
        //use the express-validator to check input items
        // req.checkBody('email', 'Email is required.').notEmpty();
        req.checkBody('email', 'Please enter valid email').isEmail();
        // req.checkBody('password', 'Password is required.').notEmpty();
        req.checkBody('password', 'Password length must be between 2-20 letters').isLength({ min: 2, max: 20 });

        var errors = req.validationErrors();
        if (errors) {
            var emailError = errors.filter(function (error) {
                return error.param == 'email';
            })
            var passwordError = errors.filter(function (error) {
                return error.param == 'password';
            })
            // res.json(errors);
            return res.render('login', {
                emailError: emailError,
                passwordError: passwordError
            });
        }
        next();
    }, passport.authenticate('local-login',
        // { session: false },
        {
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
        }
    );


    router.post('/signup', function (req, res, next) {
        //use the express-validator to check input items
        req.checkBody('email', 'Email is required.').notEmpty();
        req.checkBody('email', 'Please enter valid Email').isEmail();
        // req.checkBody('displayname', 'Display Name is required').notEmpty();
        req.checkBody('displayname', 'Display name length must be between 2 and 20').isLength({ min: 2, max: 20 })
        // req.checkBody('password', 'Password is required.').notEmpty();
        req.checkBody('password', 'The password length must be between 2 and 20.').isLength({ min: 2, max: 20 });
        req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


        var errors = req.validationErrors();
        if (errors) {
            // return res.redirect(JSON.stringify(err))
            var emailError = errors.filter(function (error) {
                return error.param == 'email';
            })
            var displayNameError = errors.filter(function (error) {
                return error.param == 'displayname';
            })
            var passwordError = errors.filter(function (error) {
                return error.param == 'password';
            })
            var password2Error = errors.filter(function (error) {
                return error.param == 'password2';
            })
            return res.render('signup', {
                emailError: emailError,
                displayNameError: displayNameError,
                passwordError: passwordError,
                password2Error: password2Error
            });
        }
        next()
    }, passport.authenticate('local-signup',
        // { session: false },
        {
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
        }
    );


    //Local Authentication - Login
    // router.post('/locallogin', passport.authenticate('local-login', {
    //     // successRedirect: '/test',
    //     failureRedirect: '/',
    //     failureFlash: true
    // }), (req, res) => {
    //     // req.session.userData = {
    //     //     username: req.user.dataValues.username,
    //     //     email: req.session.email = req.user.dataValues.email
    //     // }
    //     //Save Username and email in sessions
    //     req.session.userData = {
    //         username: req.user.dataValues.username,
    //         email: req.user.dataValues.email
    //     }
    //     // console.log(req.user.dataValues);
    //     res.redirect('/test');
    // });

    // //Local Authentication - Sign Up
    // router.post('/signup', passport.authenticate('local-signup', {
    //     // successRedirect: '/test',
    //     failureRedirect: '/',
    //     failureFlash: true
    // }), (req, res) => {
    //     //Save Username and email in sessions
    //     req.session.userData = {
    //         username: req.user.dataValues.username,
    //         email: req.user.dataValues.email
    //     }
    //     // console.log(req.user.dataValues);
    //     res.redirect('/test');
    // });


    // router.post('/locallogin',


    // passport.authenticate('local-login',
    //         // { session: false },
    //         {
    //             successRedirect: '/test',
    //             failureRedirect: '/',
    //             failureFlash: true
    //         })
    // )

    router.get('/error', (req, res) => {
        res.send('You are not logged in!');
    });

    router.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            console.log("logouted")
            if (err) { console.log(err) }
            res.redirect('/'); //Inside a callback… bulletproof!
        })
    });
    return router;
}