const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = require('./router')(express);


var port = process.env.PORT || 8080;

app.use(express.static('public'));

app.use('/', router);

const http = require('http').Server(app);
const io = require('socket.io')(http);

io.on('connection', function(socket){
    socket.on('message', function(message){
         console.log('recieved :',message);
        io.emit('message', message);
    })
})

http.listen(port);