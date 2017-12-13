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
    //console.log(socket.server.eio.clientsCount);
    
    socket.on('message', function(message){
        //console.log('recieved :',message);
        let room = "";
        for(var x in io.sockets.adapter.rooms){
            if(Object.getOwnPropertyNames(io.sockets.adapter.rooms[x].sockets)[0]!=x&&io.sockets.adapter.rooms[x].sockets.hasOwnProperty(socket.id)){
                room = x;
            }
            console.log(room);
        }
        // if(socket.server.eio.clientsCount<=2){
            io.to(room).emit('message', message,socket.id);
        // }
    })
    socket.on('create or join',function(room){
        var numClients = socket.server.eio.clientsCount;
        // console.log(socket.server.eio.clientsCount);
        
        // console.log(`Room ${room} now has ${numClients} client(s)`);
        var roomClients = io.sockets.adapter.rooms[room]?io.sockets.adapter.rooms[room].length:0;
        if(roomClients===0){
            socket.join(room);
            // console.log(`Client ID ${socket.id} created room ${room}`);
            socket.emit('created',room,socket.id);
        }
        else if(roomClients===1){
            socket.join(room);
            // console.log(`Client ID ${socket.id} joined room ${room}`);
            socket.emit('joined',room,socket.id);
        }
        else {
            socket.emit('full',room);
        }
        // if(numClients===1){
        //     socket.join(room);
        //     console.log(`Client ID ${socket.id} created room ${room}`);
        //     socket.emit('created',room,socket.id);
        // }
        // else if(numClients===2){
        //     socket.join(room);
        //     console.log(`Client ID ${socket.id} joined room ${room}`);
        //     socket.emit('joined',room,socket.id);
        // }
        // else {
        //     socket.emit('full',room);
        // }
        // console.log(io.sockets.adapter.rooms[room]);
        // console.log(io.sockets.adapter.rooms)
        // console.log(`number of clients ${numClients}`)
        // console.log(io.sockets.adapter.rooms);
        // for(var x in io.sockets.adapter.rooms){

        //     console.log(Object.getOwnPropertyNames(io.sockets.adapter.rooms[x].sockets)[0]==x);
        //     console.log(io.sockets.adapter.rooms[x].sockets);
        // }
        // console.log(io.sockets.adapter.rooms);
    })
    
})

http.listen(port);