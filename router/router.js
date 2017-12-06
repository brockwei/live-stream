const passport = require('passport');

module.exports = (express) => {

    const router = express.Router();

    function isLoggedIn(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect('/auth/facebook');
    }
    // Secret Path to be protected
    router.get('/test',  isLoggedIn, (req, res) => {
        res.sendFile(__dirname+ '/test.html');
    });
    router.get('/auth/facebook', passport.authenticate('facebook',{ 
        scope: ['user_friends', 'manage_pages','email'] 
    }));
    // The Redirect URL route.
    router.get('/auth/facebook/callback', passport.authenticate('facebook',{ 
        failureRedirect:'/'
    }),(req,res)=>{
        //console.log(req.session);
        res.redirect('/test');
    });
    router.get('/error', (req, res) => {
        res.send('You are not logged in!');
    });
    router.get('/', (req, res) => {
        //res.sendFile(__dirname + '/login.html');
        if(!req.isAuthenticated()){
            res.sendFile(__dirname + '/login.html');
        }
        else {
            res.sendFile(__dirname + '/index.html');
        }
    });
    router.get('/logout',(req,res)=>{
        req.logout();
        res.redirect("/")
    });
    return router;
}