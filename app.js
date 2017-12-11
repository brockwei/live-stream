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
const session = require('express-session');
const setupPassport = require('./controller/passport');
const bodyParser = require('body-parser');
const router = require('./router/router')(express);
const port = process.env.PORT || 8080;

app.use(express.static('public'));

//Redis
//const client = require('./controller/redis');

app.use(session({
    secret: 'supersecret'
}));
app.use(bodyParser());
setupPassport(app);
app.use('/', router);

app.listen(port);