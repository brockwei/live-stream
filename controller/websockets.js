const client = require('./redis');

module.exports = (io) =>{
    io.on("connection", function(socket) {
        console.log(`User connected to the socket`);

        socket.on('disconnect', () => {
            console.log(`User left the socket`);
        });
        socket.on('chat message', function(msg){
            io.emit('chat message', msg);
        });
        // socket.on("stream", function(img) {
        //     socket.broadcast.emit("stream", img);
        // });
    });
}