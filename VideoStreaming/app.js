var fs = require('fs');
var express = require("express");
var app = new express();
// Set port, default 8888
var port = process.env.PORT || 8080;

var server = require('http').createServer(app);

var io = require("socket.io")(server);

//io.set('origins', 'mdewo.com:'+port);
// var Log = require("log"),
	// log = new Log("debug");

app.use(express.static( __dirname + "/public" ));

app.get("/", function(req, res) {
	res.sendFile(__dirname + '/index4.html');
});



io.on("connection", function(socket) {
    // log.info("New client");
    console.log('user connected');
    //console.log('haha');
	socket.on("stream", function(img) {
		socket.broadcast.emit("stream", img);
    });
    
    socket.on('radio', function(blob) {
        // can choose to broadcast it to whoever you want
        //console.log(/*'listening...'*/blob);
        /*io.emit('voice', blob);*/
        socket.broadcast.emit('voice', blob);
    });
    
    // io.on('voice', function(blob) {
    //     console.log('haha');
    //     // can choose to broadcast it to whoever you want
    //     io.broadcast.emit('voice', blob);
    // });
    
});

server.listen(port, function() {
    // 	log.info("Listening port %s", port);
     });