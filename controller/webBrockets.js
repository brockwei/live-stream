const client = require('./redis');
const translate = require('google-translate-api');

//Database
const Model = require('../models');
const User = Model.user;
const Relations = Model.relations;
const Messages = Model.messages;

module.exports = (io) => {
    io.on("connection", function (socket) {
        /*-1- If server crashes - kicks all users out (Must be -1-)*/
        if (!socket.request.session.userData) { //This value needs to be changed
            let destination = '/';
            io.emit('chat timed out', destination);
        }
        /*-2- Storing socket.id into the session*/
        if (socket.request.sessionStore.sessions[socket.request.sessionID]) {
            let currentSession = JSON.parse(socket.request.sessionStore.sessions[socket.request.sessionID]);
            currentSession.socketID = socket.id;
            socket.request.sessionStore.sessions[socket.request.sessionID] = JSON.stringify(currentSession);
            console.log(`..........${socket.id}............`);
            // console.log(socket.request.sessionStore.sessions);
        }
        /*-3- On socket connection, emit to client some information about the user*/
        io.to(socket.id).emit('config user data', socket.request.session.userData);
        /*-4- For facebook login, if username = null, requests username*/
        if (socket.request.session.userData) {
            if (socket.request.session.userData.username == null) {
                io.to(socket.id).emit('config require username', 'Placeholder');
            }
        }
        /*-5- */
        socket.on('config submit username', function (username) {
            User.findAll({ where: { "username": username } }).then(user => {
                if (user[0]) {
                    io.to(socket.id).emit('config require username failed', 'Placeholder');
                }
                else {
                    User.update({ "username": username }, { where: { "email": socket.request.session.userData.email } }).then(() => {
                        io.to(socket.id).emit('config oauth username created', username);
                    });
                }
            })
        })
        /*-6- */
        socket.on('config oauth username created', function (username) {
            socket.request.session.userData.username = username;
            // 
            socket.request.sessionStore.online[username] = socket.id;
            // 
            console.log(socket.request.sessionStore.online);
            io.to(socket.id).emit('config user data', socket.request.session.userData);
        })
        /*-7- On login, adds user and its corresponding socketID to online list in external session store*/
        if (socket.request.session.userData) {
            socket.request.sessionStore.online = {};
            // socket.request.sessionStore.online[socket.request.session.userData.username] = socket.id;
            for (var i in socket.request.sessionStore.sessions) {
                // console.log(JSON.parse(socket.request.sessionStore.sessions[i]));
                if (JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport')) {
                    socket.request.sessionStore.online[JSON.parse(socket.request.sessionStore.sessions[i]).userData.username] = JSON.parse(socket.request.sessionStore.sessions[i]).socketID;
                }
            }
            // console.log(socket.request.sessionStore.online);
        }
        /*-8- On login, loads online friends list*/
        if (socket.request.session.userData) {
            let loadFriends = { where: { "username": socket.request.session.userData.username } };
            Relations.findAll(loadFriends).then(status => {
                let onlineFriends = [];
                let pendingFriends = [];
                let offlineFriends = [];
                for (var i in status) {
                    if (status[i].dataValues.status == "friends" && socket.request.sessionStore.online.hasOwnProperty(status[i].dataValues.friend)) {
                        onlineFriends.push(status[i].dataValues.friend);
                    }
                    else if (status[i].dataValues.status == "pending") { pendingFriends.push(status[i].dataValues.friend) }
                    else if (status[i].dataValues.status == "friends") {
                        offlineFriends.push(status[i].dataValues.friend);
                    }
                }

                io.to(socket.id).emit('control friend list', pendingFriends, onlineFriends, offlineFriends);
                //Emit to online friends that you're online
                for (var i in onlineFriends) {
                    io.to(socket.request.sessionStore.online[onlineFriends[i]]).emit('control notify online friends', socket.request.session.userData.username);
                }
            });

            // typing...
            socket.on('typing', function (username) {
                // console.log(username);
                io.to(socket.request.sessionStore.online[username]).emit('typing', socket.request.session.userData.username);
            });

        }

        //Control panel
        socket.on('control user search', function (username) {
            //Searches if user is an existing user
            User.findAll({ where: { "username": username } }).then(user => {
                //Searches for friend status
                let friendStatus = {
                    where: {
                        "username": socket.request.session.userData.username,
                        "friend": username
                    }
                }
                Relations.findAll(friendStatus).then(status => {
                    let requestStatus = status.length == 0 ? "" : status[0].dataValues.status;
                    // console.log(socket.id);
                    // console.log(user[0].dataValues.username);
                    let username = user.length == 0 ? "User not found" :
                        socket.request.session.userData.username == user[0].dataValues.username ? "This is you" : user[0].dataValues.username;
                    io.to(socket.id).emit('control user search', username, requestStatus);
                });

            });
        })
        socket.on('control friend request', function (username) {
            //Searches for Bilateral relationships between the two users
            let friendStatus1 = {
                where: {
                    "username": socket.request.session.userData.username,
                    "friend": username
                }
            }
            let friendStatus2 = {
                where: {
                    "username": username,
                    "friend": socket.request.session.userData.username
                }
            }
            let friendRequest = function (status) {
                //If other person is online, sends him direct notification
                for (var i in socket.request.sessionStore.sessions) {
                    if (socket.request.sessionStore.online.hasOwnProperty(username)) {
                        let requestedSocket = socket.request.sessionStore.online[username];
                        io.to(requestedSocket).emit('control notify online friends', "Placeholder");
                    }
                }
            }
            //Database
            Relations.findAll(friendStatus1).then(status => {
                //If no existing relationship exists, creates relation
                if (status.length == 0) {
                    Relations.create({
                        username: socket.request.session.userData.username,
                        friend: username,
                        status: 'sent'
                    }).then(function () {
                        io.to(socket.id).emit('control user search', username, 'sent');
                    });
                    Relations.create({
                        username: username,
                        friend: socket.request.session.userData.username,
                        status: 'pending'
                    }).then(function () {
                        friendRequest('pending');
                    });
                }
                //If status is pending, updates both so that Friendship is accepted
                else if (status[0].dataValues.status == 'pending') {
                    Relations.update({ status: 'friends' }, friendStatus1).then(function () {
                        // io.to(socket.id).emit('control user search',username,'friends');
                        io.to(socket.id).emit('control notify online friends', "Placeholder");
                    });
                    Relations.update({ status: 'friends' }, friendStatus2).then(function () {
                        friendRequest('friends');
                    });
                }
            })
        })
        
        socket.on('control friend delete', function (username) {
            let friendStatus1 = {
                where: {
                    "username": socket.request.session.userData.username,
                    "friend": username
                }
            }
            let friendStatus2 = {
                where: {
                    "username": username,
                    "friend": socket.request.session.userData.username
                }
            }
            Relations.destroy(friendStatus1).then(function () {
                // io.to(socket.id).emit('control user search',username,"");
                io.to(socket.id).emit('control notify online friends', "Placeholder");
            })
            Relations.destroy(friendStatus2).then(function () {
                //If other person is online, sends him direct notification
                for (var i in socket.request.sessionStore.sessions) {
                    // console.log(JSON.parse(socket.request.sessionStore.sessions[i]));
                    // if(JSON.parse(socket.request.sessionStore.sessions[i]).hasOwnProperty('passport')){
                    //     if(JSON.parse(socket.request.sessionStore.sessions[i]).userData.username==username){
                    //         let requestedSocket = JSON.parse(socket.request.sessionStore.sessions[i]).socketID;
                    //         io.to(requestedSocket).emit('control user search',socket.request.session.userData.username,'');
                    //     }
                    // }
                    if (socket.request.sessionStore.online.hasOwnProperty(username)) {
                        let requestedSocket = socket.request.sessionStore.online[username];
                        // io.to(requestedSocket).emit('control user search',socket.request.session.userData.username,'');
                        io.to(requestedSocket).emit('control friend delete', socket.request.session.userData.username);
                        io.to(requestedSocket).emit('control notify online friends', "Placeholder");
                    }
                }
            })
        })
        //Friends List Javascript
        socket.on('control request friends list', function () {
            let loadFriends = { where: { "username": socket.request.session.userData.username } };
            Relations.findAll(loadFriends).then(status => {
                let onlineFriends = [];
                let pendingFriends = [];
                let offlineFriends = [];
                for (var i in status) {
                    if (status[i].dataValues.status == "friends" && socket.request.sessionStore.online.hasOwnProperty(status[i].dataValues.friend)) {
                        onlineFriends.push(status[i].dataValues.friend);
                    }
                    else if (status[i].dataValues.status == "pending") { pendingFriends.push(status[i].dataValues.friend) }
                    else if (status[i].dataValues.status == "friends") {
                        offlineFriends.push(status[i].dataValues.friend);
                    }
                }
                io.to(socket.id).emit('control friend list', pendingFriends, onlineFriends, offlineFriends);
            });
        })
        //Logouting out
        socket.on('disconnect', () => {
            if (socket.request.session.userData) {
                delete socket.request.sessionStore.online[socket.request.session.userData.username];
            }
            io.emit('control notify online friends', 'test');
        });
        //Set Chatroom Target
        socket.on('control message target', (username) => {
            socket.request.session.targetSocket = socket.request.sessionStore.online[username];
        });

        socket.on('control retrieve unread messages', (placeholder) => {
            let constraints = { where: { "username": socket.request.session.userData.username, "type": "from" }, order: [['createdAt', 'ASC']] };
            Messages.findAll(constraints).then(msg => {
                let users = [];
                for (var i in msg) {
                    if (!users.includes(msg[i].dataValues.friend)) {
                        users.push(msg[i].dataValues.friend);
                    };
                }
                io.to(socket.id).emit('control retrieve unread messages', users);
            })
        })
        socket.on('chat retrieve messages', function (username) {
            let constraints = { where: { "username": socket.request.session.userData.username, "friend": username }, order: [['createdAt', 'ASC']] };
            Messages.findAll(constraints).then(msg => {
                let msgs = [];
                for (var i in msg) {
                    msgs.push(msg[i].dataValues)
                }
                io.to(socket.id).emit('chat message', msgs, username);
            })
        });
        //Send chat message
        socket.on('chat message', function (message, username) {

            if (username) {
                // let targetSocket = socket.request.session.targetSocket;
                let targetSocket = socket.request.sessionStore.online[username];
                // console.log(targetSocket + "okay yay");
                Messages.create({
                    username: socket.request.session.userData.username,
                    friend: username,
                    message: message,
                    type: "to"
                }).then(function () {
                    let constraints = { where: { "username": socket.request.session.userData.username, "friend": username }, order: [['createdAt', 'ASC']] };
                    Messages.findAll(constraints).then(msg => {
                        let msgs = [];
                        for (var i in msg) {
                            msgs.push(msg[i].dataValues)
                        }
                        io.to(socket.id).emit('chat message', msgs, username);
                    })
                });
                Messages.create({
                    username: username,
                    friend: socket.request.session.userData.username,
                    message: message,
                    type: "from"
                }).then(function () {
                    let constraints = { where: { "username": username, "friend": socket.request.session.userData.username }, order: [['createdAt', 'ASC']] };
                    Messages.findAll(constraints).then(msg => {
                        let msgs = [];
                        for (var i in msg) {
                            msgs.push(msg[i].dataValues)
                        }
                        io.to(targetSocket).emit('chat message', msgs, socket.request.session.userData.username);
                    })
                });
            }
        })
        //Read messages 
        socket.on('chat message read', function (username) {
            let constraints = {
                where: {
                    "username": socket.request.session.userData.username,
                    "friend": username,
                    "type": "from"
                }
            };
            // Messages.findAll(constraints).then(msg=>{
            //     console.log(msg);
            // })
            Messages.update({ "type": "read" }, constraints).then(() => { });
        })
        //WebRTC connection
        socket.on('wrtc connection request', function (username) {
            // console.log('step 1');
            let targetSocket = socket.request.sessionStore.online[username];
            io.to(targetSocket).emit('wrtc connection request', 'Placeholder');
        })
        socket.on('message', function (message, username) {

            let targetSocket = socket.request.sessionStore.online[username];
            // console.log('step 4' + username);
            // console.log(targetSocket);
            io.to(targetSocket).emit('message', message);
        })

        // WebRTC connection
        socket.on('wrtc send video request', function (username) {
            let targetSocket = socket.request.sessionStore.online[username];
            io.to(targetSocket).emit('wrtc send video request', socket.request.session.userData.username);
        })
        socket.on('wrtc cancel video request', function (username) {
            let targetSocket = socket.request.sessionStore.online[username];
            io.to(targetSocket).emit('wrtc cancel video request', 'placeholder');
        })
        socket.on('wrtc connection accepted', function (username) {
            let targetSocket = socket.request.sessionStore.online[username];
            io.to(targetSocket).emit('wrtc connection accepted', 'placeholder');
        });
        socket.on('wrtc close peer connection', function (username) {
            let targetSocket = socket.request.sessionStore.online[username];
            io.to(targetSocket).emit('wrtc close peer connection', 'placeholder');
        })
        /*Experiment*/
        // socket.on('hehexd test', function(target){
        //     console.log(socket.request.sessionStore);
        //     for(var i in socket.request.sessionStore.sessions){
        //         if(JSON.parse(socket.request.sessionStore.sessions[i]).userData.username==target){
        //             let targetSocket = JSON.parse(socket.request.sessionStore.sessions[i]).socketID;
        //             // JSON.parse(socket.request.sessionStore.sessions[i]).userData.targetSocket = targetSocket;
        //             socket.request.session.targetSocket = targetSocket;
        //             io.to(targetSocket).emit('chat test', socket.request.session.userData.username);
        //         }
        //     }
        // })
        /*Experimental end */

        // Group Chat - Javascript
        let rooms = [];
        let groupChatData = {
            numberOfUsers: 0,
            users: []
        }
        socket.on('control group add user', function (obj) {
            obj = JSON.parse(obj);
            socket.username = obj.username;
            socket.room = obj.roomname;
            console.log('socket.room ' + socket.room);
            // send client to the room
            socket.join(socket.room);
            client.lrange(`${socket.room}`, 0, -1, function (err, data) {
                io.to(socket.id).emit('group chat history', data)
            });
            io.to(socket.id).emit('group chat updatechat', 'SERVER', 'you have connected to room1');
            socket.broadcast.to(`${socket.room}`).emit('group chat updatechat', 'SERVER', socket.username + ' has connected to this room');
            // console.log('emailsssss ' + socket.request.session.userData.email);
            let emailAndName = {
                email: socket.request.session.userData.email,
                username: socket.request.session.userData.username,
            }
            // console.log(emailAndName);
            emailAndName = JSON.stringify(emailAndName);
            // console.log('emailandname ' + emailAndName);
            client.sadd(`${socket.room}_userlist`, emailAndName, function (err, num) {
                if (err) { return console.log(err) }
                groupChatData.numberOfUsers = num;
                client.smembers(`${socket.room}_userlist`, function (err, reply) {
                    console.log('reply ' + reply);
                    io.emit('group user data', reply);
                });
            });

        });
        // 
        socket.on('disconnect', () => {
            if (socket.request.session.userData) {
                let emailAndName = {
                    email: socket.request.session.userData.email,
                    username: socket.request.session.userData.username,
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
                        io.emit('group user data', reply);
                    })
                });
                console.log(`${socket.username} left the socket`);
            }
        });
        // 
        socket.on('group chat message', function (msg) {
            console.log('group chat message recieved');
            // io.emit('chat message', msg);
            let message = {
                // 'user': username,
                'user': socket.request.session.userData.username,
                'email': socket.request.session.userData.email,
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
                    io.to(`${socket.room}`).emit('group chat message', data)
                })
            })
        });
        socket.on('group chat leave room', function (room) {
            socket.leave(room);
        })




        // Caption
        socket.on('video voice interim message', function (message, username) {
            let targetSocket = socket.request.sessionStore.online[username];
            // console.log('interim message ' + message)

            // translate(`${message}`, { from:`${socket.request.sessionStore.fromlanguagekey}`, to: `${socket.request.sessionStore.languagekey}` }).then(res => {

            translate(`${message}`, { to: `${socket.request.sessionStore.languagekey}` }).then(res => {
                // console.log(res.text);
                //=> I speak English
                message = res.text;
                // console.log(res.from.language.iso);
                // console.log('video interim message ' + message)
                io.to(targetSocket).emit('video voice interim remote message', message);

                //=> nl 
            }).catch(err => {
                console.error(err);
            });

        });
        socket.on('video voice desired lang key', function (key) {
            socket.request.sessionStore.languagekey = key;
            console.log('video voice desired lang key ' + socket.request.sessionStore.languagekey)
            // console.log('socket.request.sessionStore.languagekey '+socket.request.sessionStore.languagekey )
        })


        // socket.on('video voice from lang key', function (key) {
        //     socket.request.sessionStore.fromlanguagekey = key;
        //     // console.log('socket.request.sessionStore.languagekey '+socket.request.sessionStore.languagekey )
        // })

        socket.on('video voice final message', function (message, username) {
            let targetSocket = socket.request.sessionStore.online[username];

            // translate(`${message}`, { from:`${socket.request.sessionStore.fromlanguagekey}`, to: `${socket.request.sessionStore.languagekey}` }).then(res => {

            translate(`${message}`, { to: `${socket.request.sessionStore.languagekey}` }).then(res => {
                // console.log(res.text);
                //=> I speak English
                // console.log('messagesss' + message)
                message = res.text;
                // console.log(res.from.language.iso);
                // console.log('video voice final message '+message);
                io.to(targetSocket).emit('video voice final remote message', message);

                //=> nl 
            }).catch(err => {
                console.error(err);
            });
        });

    });
}