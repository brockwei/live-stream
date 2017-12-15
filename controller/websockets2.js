const client = require('./redis');

module.exports = (io) => {
    io.on("connection", function (socket) {

        var rooms = [];
        // var usernames = {};

        let chatroomData = {
            numberOfUsers: 0,
            users: []
        }

        //loading history from redis
        // client.lrange('holymoly', 0, -1, function (err, data) {

        //     io.emit('chat history', data)

        // })

        // client.lrange(`${socket.room}`, 0, -1, function (err, data) {
        //     console.log('socket.room '+socket.room)
        //     io.emit('chat history', data)

        // })

        // usernames which are currently connected to the chat

        // rooms which are currently available in chat
        // var rooms = ['room1', 'room2', 'room3'];

        //ask the user for a display name and 
        socket.on('chat adduser', function (username) {
            // store the username in the socket session for this client
            socket.username = username;
            console.log('chat adduser');
            console.log(socket.username);
            console.log('socket.request.session.name '+socket.request.session.displayname);
            socket.request.session.displayname = username;
            // store the room name in the socket session for this client
            // socket.room = 'room1';
            // add the client's username to the global list
            // usernames[username] = username;
            // console.log('usernames ' + JSON.stringify(usernames))
            chatroomData.users.push(socket.username)

            // send client to room 1
            // socket.join('room1');
            // echo to client they've connected
            socket.emit('updatechat', 'SERVER', 'you have connected to room1');
            // echo to room 1 that a person has connected to their room
            socket.broadcast.to(`${rooms[0]}`).emit('updatechat', 'SERVER', socket.username + ' has connected to this room');
            socket.emit('updaterooms', rooms, 'room1');
        });

        socket.on('chat roomname', function (roomname) {
            socket.room = roomname;
            rooms.push(roomname);
            console.log('roomname '+roomname);
            // send client to room 1
            socket.join(socket.room);
            console.log('room0 '+rooms[0]);

            client.lrange(`${socket.room}`, 0, -1, function (err, data) {
                console.log('socket.room '+socket.room)
                io.emit('chat history', data)
    
            })

        })

        //('email id')send the email address received in the backend to the frontend
        io.to(socket.id).emit('email id', socket.request.session.email);



        // for (var i in socket.request.sessionStore.sessions) {
        //     // JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport') ?            
        //     // JSON.parse(socket.request.sessionStore.sessions[i]).passport.hasOwnProperty('user') ?
        //     // chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).name)
        //     // delete socket.request.sessionStore.sessions[i];
        //     if (JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport')) {
        //         chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).name)
        //     }

        //     // console.log(socket.request.sessionStore.sessions[i]);
        // }

        chatroomData.numberOfUsers = Object.keys(socket.request.sessionStore.sessions).length;
        chatroomData.numberOfUsers = chatroomData.users.length;
        
        // console.log('socket.request')
        // console.log(socket.request.sessionStore.sessions)
        io.emit('user data', chatroomData);
        let username = '';
        let email = '';
        if (!socket.request.session.name) {
            let destination = '/test';
            io.emit('redirect', destination);
        } 
        else {
            // username = socket.request.session.name;
            username = socket.username
            console.log('username123 '+socket.username);        
            email = socket.request.session.email;
        }

        socket.on('disconnect', () => {
            chatroomData = {
                numberOfUsers: 0,
                users: []
            }
            for (var i in socket.request.sessionStore.sessions) {
                //    JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport') ?

                //    JSON.parse(socket.request.sessionStore.sessions[i]).passport.hasOwnProperty('user') ?
                //    chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).name)
                //    delete socket.request.sessionStore.sessions[i];
                if (JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport')) {
                    chatroomData.users.push(JSON.parse(socket.request.sessionStore.sessions[i]).name)
                }
            }
            console.log(`${username} left the socket`);
            io.emit('user data', chatroomData);
        });

        //this part pass the data from the backend to frontend
        socket.on('chat message', function (msg) {
            // io.emit('chat message', msg);
            let message = {
                // 'user': username,
                'user': socket.username,              
                'email': email,
                'msg': msg
            }
            let message2 = JSON.stringify(message);
            // console.log('messagesss '+message);
            // console.log(message);
            // client.rpush('holymoly', message2, function (err, data) {
            //     if (err) {
            //         return console.log(err);
            //     }
            //     client.lrange('holymoly', -1, -1, function (err, data) {
            //         if (err) {
            //             return console.log(err);
            //         }
            //         io.emit('chat message', data)
            //     })
            // })

            client.rpush(`${rooms[0]}`, message2, function (err, data) {
                if (err) {
                    return console.log(err);
                }
                client.lrange(`${rooms[0]}`, -1, -1, function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    io.emit('chat message', data)
                })
            })

        });

    });
}