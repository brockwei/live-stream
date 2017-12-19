/*Modules installed:
- express

-socket.io
-postgresql
-sequelize

-dotenv

-passport
-passport-facebook
*/

const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const session = require('express-session');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const passport = require('passport');
const setupPassport = require('./controller/passport');
const expressValidator = require('express-validator');
const router = require('./router/router')(express);
const port = process.env.PORT
const flash = require('connect-flash')
const io = require('socket.io')(http, {
    pingInterval: 10000,
    pingTimeout: 5000000,
    cookie: false
});
io.set('heartbeat timeout', 40000);
io.set('heartbeat interval', 20000);
const websocket =require('./controller/webBrockets')(io);
const redis = require('redis');
const exphbs = require('express-handlebars');
var path = require('path');

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

app.use(express.static('public'));

//Redis
const client = require('./controller/redis');

const sessionMiddleware = session({
    secret: 'supersecret'
});
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});
app.use(sessionMiddleware);
// app.use(session({
//     secret: 'supersecret'
// }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

setupPassport(app);

app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(cookieParser('keyboard cat'));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(expressValidator(

    {
        errorFormatter: function (param, msg, value) {
            var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

            while (namespace.length) {
                formParam += '[' + namespace.shift() + ']';
            }
            return {
                param: formParam,
                msg: msg,
                value: value
            };
        }
    }

))

// Connect Flash
app.use(flash());

// Global Vars
// app.use(function (req, res, next) {
//     res.locals.success_msg = req.flash('success_msg');
//     res.locals.error_msg = req.flash('error_msg');
//     res.locals.error = req.flash('error');
//     res.locals.user = req.user || null;
//     next();
// });


app.use('/', router);

http.listen(port);
console.log("Listening to " + port);