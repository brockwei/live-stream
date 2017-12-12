const client = require('./redis');

module.exports = (io) =>{
    io.on("connection", function(socket) {
        io.to(socket.id).emit('email id', socket.request.session.email);

        let chatroomData = {
            numberOfUsers: 0,
            users: []
        }

        for(var i in socket.request.sessionStore.sessions) {
            // JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport') ?            
            // JSON.parse(socket.request.sessionStore.sessions[i]).passport.hasOwnProperty('user') ?
            // chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).name)
            // delete socket.request.sessionStore.sessions[i];
            if (JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport')){
                chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).name)
            }

            console.log(socket.request.sessionStore.sessions[i]);
        }
        chatroomData.numberOfUsers = Object.keys(socket.request.sessionStore.sessions).length;
        io.emit('user data', chatroomData);
        let username='';
        let email='';
        if(!socket.request.session.name){
            let destination = '/test';
            io.emit('redirect', destination);
        }
        else {
            username = socket.request.session.name;
            email = socket.request.session.email;
        }
        if(!socket.request.session.name){
            let destination = '/test';
            io.emit('redirect', destination);
        }
        else {
            username = socket.request.session.name;
            email = socket.request.session.email;
        }

        socket.on('disconnect', () => {
           chatroomData = {
               numberOfUsers:0,
               users:[]
           }
           for(var i in socket.request.sessionStore.sessions) {
            //    JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport') ?
               
            //    JSON.parse(socket.request.sessionStore.sessions[i]).passport.hasOwnProperty('user') ?
            //    chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).name)
            //    delete socket.request.sessionStore.sessions[i];
            if (JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport')){
                chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).name)
            }
           }
           console.log(`${username} left the socket`);
           io.emit('user data', chatroomData);
        });
        
        //this part pass the data from the backend to frontend
        socket.on('chat message', function(msg){
            // io.emit('chat message', msg);
            let message = {
                'user': username,
                'email': email,
                'msg': msg
            }
            let message2 = JSON.stringify(message);
            console.log('messagesss '+message);
            console.log(message);
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