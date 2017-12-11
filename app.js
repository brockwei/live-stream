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
const setupPassport = require('./controller/passport');
const bodyParser = require('body-parser');
const router = require('./router/router')(express);
const port = process.env.PORT || 3030;
const io = require('socket.io')(http);
const websocket =require('./controller/websockets')(io)
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

setupPassport(app);
app.use('/', router);

http.listen(port);