const client = require('./redis');

module.exports = (io) => {
    io.on("connection", function (socket) {

        var rooms = [];
        // var usernames = {};

        let chatroomData = {
            numberOfUsers: 0,
            users: []
        }

        //ask the user for a display name and 
        socket.on('chat adduser room', function (obj) {
            // store the username in the socket session for this client
            obj = JSON.parse(obj);

            socket.username = obj.username;

            socket.room = obj.roomname;

            console.log('socket.room ' + socket.room);
            // send client to the room
            socket.join(socket.room);

            client.lrange(`${socket.room}`, 0, -1, function (err, data) {
                // console.log('socket.room ' + socket.room)
                // console.log('chathistory '+ data)
                io.emit('chat history', data)
            });

            // send client to room 1
            // echo to client they've connected
            socket.emit('updatechat', 'SERVER', 'you have connected to room1');
            // echo to room 1 that a person has connected to their room
            // socket.broadcast.to(`${socket.room}`).emit('updatechat', 'SERVER', socket.username + ' has connected to this room');
            // socket.emit('updaterooms', rooms, 'room1');

            // socket.emit('user data', socket.chatroomData);

            // echo to room 1 that a person has connected to their room
            socket.broadcast.to(`${socket.room}`).emit('updatechat', 'SERVER', socket.username + ' has connected to this room');
            console.log('emailsssss ' + socket.request.session.email);



            let emailAndName = {
                email: socket.request.session.email,
                username: socket.username
            }

            emailAndName = JSON.stringify(emailAndName)

            console.log('emailandname ' + emailAndName)

            client.sadd(`${socket.room}_userlist`, emailAndName, function (err, num) {
                if (err) { return console.log(err) }

                chatroomData.numberOfUsers = num;

                client.smembers(`${socket.room}_userlist`, function (err, reply) {
                    console.log('reply ' + reply);

                    io.emit('user data', reply);

                });

            });

        });

    // typing...
        // socket.on('typing',function(){
        //     console.log('someone typing');
        //     socket.broadcast.emit('typing', socket.username);
        // });


        //('email id')send the email address received in the backend to the frontend
        io.to(socket.id).emit('email id', socket.request.session.email);


        chatroomData.numberOfUsers = Object.keys(socket.request.sessionStore.sessions).length;
        // chatroomData.numberOfUsers = chatroomData.users.length;

        // io.emit('user data', chatroomData);
        // let username = '';
        let email = '';
        if (!socket.request.session.name) {
            let destination = '/test';
            io.emit('redirect', destination);
        }
        else {
            // username = socket.request.session.name;
            // username = socket.username
            // console.log('username123 ' + socket.username);
            email = socket.request.session.email;
        }

        socket.on('disconnect', () => {

            let emailAndName = {
                email: socket.request.session.email,
                username: socket.username
            }

            emailAndName = JSON.stringify(emailAndName)

            client.srem(`${socket.room}_userlist`, `${emailAndName}`, function (err, reply) {

                if (err) {
                    return console.log(err);
                }

                client.smembers(`${socket.room}_userlist`, function (err, reply) {
                    if (err) {
                        return console.log(err);
                    }

                    io.emit('user data', reply);

                })
                // console.log('reply ' + reply);

                // io.emit('user data', reply);

            });

            console.log(`${socket.username} left the socket`);
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
            message = JSON.stringify(message);

            client.rpush(`${socket.room}`, message, function (err, data) {
                if (err) {
                    return console.log(err);
                }
                client.lrange(`${socket.room}`, -1, -1, function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    io.emit('chat message', data)
                })
            })

        });

    });
}