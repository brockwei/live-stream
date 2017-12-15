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
const setupPassport = require('./controller/passport');
const validator = require('express-validator');
const router = require('./router/router')(express);
const port = process.env.PORT
const io = require('socket.io')(http, {
    pingInterval: 10000,
    pingTimeout: 5000000,
    cookie: false
});
io.set('heartbeat timeout', 40000); 
io.set('heartbeat interval', 20000);
const websocket =require('./controller/websockets2')(io)
const redis = require('redis');
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
app.use(bodyParser.urlencoded({extended: false}));
app.use(validator());

setupPassport(app);
app.use('/', router);

http.listen(port);
console.log("Listening to " + port);