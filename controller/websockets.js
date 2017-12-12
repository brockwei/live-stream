const client = require('./redis');

module.exports = (io) =>{
    io.on("connection", function(socket) {
        io.to(socket.id).emit('email id', socket.request.session.email);

        let chatroomData = {
            numberOfUsers: 0,
            users: []
        }
        for(var i in socket.request.sessionStore.sessions) {
            JSON.parse(socket.request.sessionStore.sessions[i]).passport.hasOwnProperty('user') ?
            chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).name) :
            delete socket.request.sessionStore.sessions[i];
        }
        chatroomData.numberOfUsers = Object.keys(socket.request.sessionStore.sessions).length;
        io.emit('user data', chatroomData);

        socket.on('disconnect', () => {
           chatroomData = {
               numberOfUsers:0,
               users:[]
           }
           for(var i in socket.request.sessionStore.sessions) {
               JSON.parse(socket.request.sessionStore.sessions[i]).passport.hasOwnProperty('user') ?
               chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).name):
               delete socket.request.sessionStore.sessions[i];
           }
           chatroomData.numberOfUsers = Object.keys(socket.request.sessionsStore.sessions).length;
           console.log(`${username} left the socket`);
           io.emit('user data', chatroomData);
        });
        socket.on('chat message', function(msg){
            // io.emit('chat message', msg);
            let message = {
                'user': username,
                'email': email,
                'msg': msg
            }
            let message2 = JSON.stringify(message);
            client.rpush('holymoly', message2, function(err, data) {
               if(err) {
                   return console.log(err);
               }
            client.lrange('holymoly',-1,-1,function(err, data) {
                if(err) {
                    return console.log(err);
                    io.emit('chat message', data)
                }
            })
            });
        });
        // socket.on("stream", function(img) {
        //     socket.broadcast.emit("stream", img);
        // });
    });
}