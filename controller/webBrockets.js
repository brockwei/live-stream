const client = require('./redis');

module.exports = (io) => {
    io.on("connection", function (socket) {
        /*-1- If server crashes - kicks all users out (Must be -1-)*/
        if(!socket.request.session.userData){ //This value needs to be changed
            let destination = '/';
            io.emit('chat timed out', destination);
        }
        /*-2- Storing socket.id into the session*/
        if(socket.request.sessionStore.sessions[socket.request.sessionID]){
            let currentSession = JSON.parse(socket.request.sessionStore.sessions[socket.request.sessionID]);
            currentSession.socketID = socket.id;
            socket.request.sessionStore.sessions[socket.request.sessionID] = JSON.stringify(currentSession);
            // console.log(`..........${socket.id}............`);
            // console.log(socket.request.sessionStore.sessions);
        }
        /*-3- On socket connection, emit to client some information about the user*/
            io.to(socket.id).emit('config user data', socket.request.session.userData);
        /*Experiment*/
        socket.on('hehexd test', function(target){
            console.log(socket.request.sessionStore);
            for(var i in socket.request.sessionStore.sessions){
                if(JSON.parse(socket.request.sessionStore.sessions[i]).userData.username==target){
                    let targetSocket = JSON.parse(socket.request.sessionStore.sessions[i]).socketID;
                    // JSON.parse(socket.request.sessionStore.sessions[i]).userData.targetSocket = targetSocket;
                    socket.request.session.targetSocket = targetSocket;
                    io.to(targetSocket).emit('chat test', socket.request.session.userData.username);
                }
            }
        })
        /*Experimental end */

        //loading history from redis
        client.lrange('holymoly', 0, -1, function (err, data) {
            io.emit('chat history', data)
        })

        let chatroomData = {
            numberOfUsers: 0,
            users: []
        }

        for (var i in socket.request.sessionStore.sessions) {
            // JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport') ?            
            // JSON.parse(socket.request.sessionStore.sessions[i]).passport.hasOwnProperty('user') ?
            // chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).name)
            // delete socket.request.sessionStore.sessions[i];
            
            if (JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport')) {
                // chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).name)
                chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).userData.username)
            }

            // console.log(socket.request.sessionStore.sessions[i]);
        }
        chatroomData.numberOfUsers = Object.keys(socket.request.sessionStore.sessions).length;
        io.emit('user data', chatroomData);
        let username = '';
        let email = '';
        if (!socket.request.session.userData) {
            let destination = '/test';
            io.emit('redirect', destination);
        }
        else {
            username = socket.request.session.userData.username;
            email = socket.request.session.userData.email;
        }

        socket.on('disconnect', () => {
            chatroomData = {
                numberOfUsers: 0,
                users: []
            }
            for (var i in socket.request.sessionStore.sessions) {
                if (JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport')) {
                    chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).userData.username)
                }
            }
            // console.log(`${username} left the socket`);
            io.emit('user data', chatroomData);
        });

        //this part pass the data from the backend to frontend
        socket.on('chat message', function (msg) {
            // io.emit('chat message', msg);
            let message = {
                'user': username,
                'email': email,
                'msg': msg
            }
            let message2 = JSON.stringify(message);
            // console.log('messagesss '+message);
            // console.log(message);
            client.rpush('holymoly', message2, function (err, data) {
                if (err) {
                    return console.log(err);
                }
                client.lrange('holymoly', -1, -1, function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    io.emit('chat message', data)
                })

                
            })

        });

        //Webcam
        socket.on('message',function(message){
            console.log(socket.request.session.targetSocket);
            io.to(socket.request.session.targetSocket).emit('message', message);
        })
        

    });
}