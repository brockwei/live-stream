const passport = require('passport');

module.exports = (express) => {

    const router = express.Router();

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }
    router.get('/', (req, res) => {
        res.sendFile(__dirname + '/login.html');
    });
    router.get('/login2', (req, res) => {
        res.sendFile(__dirname + '/login2.html');
    });
    // Secret Path to be protected
    router.get('/test', isLoggedIn, (req, res) => {
        res.sendFile(__dirname + '/test.html');
    });
    router.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['user_friends', 'manage_pages', 'email']
    }));
    // The Redirect URL route.
    router.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/'
    }), (req, res) => {
        //console.log(req.session);
        // console.log('fb: '+ req.user);
        let name = req.user.profile.name.givenName;
        req.session.name = name;
        req.session.email = req.user.profile._json.email;
        res.redirect('/test');
        // console.log('facebook'+req.user)
        // console.log(req.user)
    });
    // auth with google+
    router.get('/auth/google', passport.authenticate('google', {
        scope: ['profile', 'email']
    }));

    // callback route for google to redirect to
    // hand control to passport to use code to grab profile info
    router.get('/auth/google/redirect', passport.authenticate('google', {
        failureRedirect: '/'
    }), (req, res) => {
        // console.log('google router');
        // console.log(req.user);
        res.redirect('/test');
        // console.log('google router'+req.user);
        // console.log(req.user)        
    });
    // router.get('/locallogin', (req, res) => {
    //     res.sendFile(__dirname + '/localLogin.html');
    // });

    router.post('/locallogin', passport.authenticate('local-login', {
        successRedirect: '/test',
        failureRedirect: '/'
    }));

    // router.get('/signup', (req, res) => {
    //     res.sendFile(__dirname + '/signup.html');
    // });

    router.post('/signup', (req,res) => {
        // let email = req.body.email;
        // let displayname = req.body.displayname;
        // let password = req.body.password;
        // let confirmPassword = req.body.confirmPassword;

        // req.checkBody('email', 'Email is required').notEmpty();
        // req.checkBody('email', 'Email is not valid').isEmail();
        // req.checkBody('displayname', 'Display name is required').notEmpty();
        // req.checkBody('password', 'Password is required').notEmpty();
        // req.checkBody('confirmPassword', 'Password is required').notEmpty();
        // req.checkBody('confirmPassword', 'Password does not match the confirm password').equals(req.body.password);

        // var errors = req.validationErrors();

        // if(errors){
        //     res.sendFile(__dirname + '/test.html',{
        //         errors:errors
        //     });
            
        // }
        // next();
    }, passport.authenticate('local-signup', {
        successRedirect: '/test',
        failureRedirect: '/'
    }));


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