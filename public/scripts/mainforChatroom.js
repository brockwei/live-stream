$(function () {
    var socket = io();
    var chatRoomConfig = {
        'username': '',
        'email'   : '',
        'targetID': '',
        'deleteID': null
    }
    //"start of messages"
    //Chatroom Javascript
    $('#chat-messages').append($('<li class="welcoming">').text(`Welcome to Michelle's Mukbang`));
    //Send chat message on form submit
    $('#chat-field').submit(function () {
        if ($('#input-field').val()) {
            socket.emit('chat message', $('#input-field').val(),chatRoomConfig.targetID);
        }
        $('#input-field').val('');
        return false;
    });

   //  Function to show a person is typing
   $('#input-field').keypress(function() {
    console.log('typing');
   socket.emit('typing');
    }); 

    function debounce(fn, delay) {
    var timer = null;
    return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
        fn.apply(context, args);
    }, delay);
    };
    }

    socket.on('typing', function(data) {
    console.log('someone else typing');
    $('#typing').html("<em>" + data + " is typing a message... </em>");
    });

    socket.on('typing', debounce( function(data){
    console.log('typinggggg');
        $('#typing').empty();
    },2000));
  
   

    //Not needed: function to show online users in chat
    socket.on('user data', function (data) {
        $('#users').empty();
        $('#users').append($('<li>').text(`${data.numberOfUsers} user${data.numberOfUsers == 1 ? "" : "s"} in chat.`));
        for (var i in data.users) {
            $('#users').append($('<li>').text(data.users[i]));
    //Load message function
    chatRoomConfig.loadMessages = function(message, scrollH){
        $('#chat-messages').empty();
        for(var i in message){
            if(message[i].type=="to"){
                $('#chat-messages').append($('<li class="chat-message chat-message-sent">').html(`<span class='chat-message-username'>${message[i].username}</span><br>${message[i].message}`));
            }
            else if (message[i].type=="read"){
                $('#chat-messages').append($('<li class="chat-message chat-message-read">').html(`<span class='chat-message-friend'>${message[i].friend}</span><br>${message[i].message}`));    
            }
            else if (message[i].type=="from"){
                $('#chat-messages').append($('<li class="chat-message chat-message-unread">').html(`<span class='chat-message-friend'>${message[i].friend}</span><br>${message[i].message}`));    
            }
            //Scrolls to the bottom of the page
            if (scrollH < 0) {
                $('.chat-area').scrollTop($('#chat-messages')[0].scrollHeight);
            }
        }
    }
    //Recieve chat log from backend
    socket.on('chat message',function(message, friend){
        let scrollH = $('#chat-messages')[0].scrollHeight - $('.chat-area').scrollTop() - $('.chat-area')[0].clientHeight;
        // if(message[0].friend==chatRoomConfig.targetID){
        if(friend==chatRoomConfig.targetID){
            let promise = new Promise((res,rej)=>{
                chatRoomConfig.loadMessages(message,scrollH);
                res();
            });
            promise.then((err)=>{
                socket.emit('chat message read', chatRoomConfig.targetID);
            })
                   
        }
        else {
            $(`[user-message=${friend}]`).addClass('control-friend-message-unread');
        }
    })
    // //function to load chatroom message history
    // function loadMessages(data, scrollH) {
    //     if (JSON.parse(data[0])["email"] == chatRoomConfig.email) {
    //         $('#chat-messages').append($('<li>').html('<span class="currentUser">' + JSON.parse(data[0])["user"] + "</span> : " + JSON.parse(data[0])["msg"]));
    //     }
    //     else {
    //         $('#chat-messages').append($('<li>').text(JSON.parse(data[0])["user"] + " : " + JSON.parse(data[0])["msg"]));
    //     }
    //     if (scrollH < 0) {
    //         $('.chat-area').scrollTop($('#chat-messages')[0].scrollHeight);
    //     }
    // }
    // //Function to input messages in chatroom
    // $('#chat-field').submit(function () {
    //     if ($('#input-field').val() == "/clear") {
    //         $('#messages').empty();
    //     } else if ($('#input-field').val()) {
    //         socket.emit('chat message', $('#input-field').val());
    //         console.log($('#input-field').val());
    //     }
    //     $('#input-field').val('');
    //     return false;
    // });

    // //Not needed: function to show online users in chat
    // socket.on('user data', function (data) {
    //     $('#users').empty();
    //     $('#users').append($('<li>').text(`${data.numberOfUsers} user${data.numberOfUsers == 1 ? "" : "s"} online.`));
    //     for (var i in data.users) {
    //         $('#users').append($('<li>').text(data.users[i]));
    //     }
    // });

    // //On chat message, scrolls to the bottom of page
    // socket.on('chat message', function (data) {
    //     let scrollH = $('#chat-messages')[0].scrollHeight - $('.chat-area').scrollTop() - $('.chat-area')[0].clientHeight;
    //     loadMessages(data, scrollH);
    //     console.log(JSON.parse(data));
    //     console.log(scrollH);
    // });
    // //Shows chat history
    // socket.once('chat history', function (data) {
    //     data.forEach(dataElement => {
    //         $('#chat-messages').append($('<li>').html('<span class="currentUser">' + JSON.parse(dataElement)["user"] + "</span> : " + JSON.parse(dataElement)["msg"]));
    //     });
    // })



    /*-1- Chat Timed Out */
    socket.on('chat timed out', function (destination) {
        window.location.href = destination;
    });
    /*-1- End */
    
    /*-3- Recieve user data from backend */
    socket.on('config user data', function (data) {
        chatRoomConfig.email = data.email;
        chatRoomConfig.username = data.username;
        // console.log(chatRoomConfig);
        $('#control-username').html(data.username+`&nbsp&nbsp<a href="/logout"><i class="fa fa-sign-out"></i></a>`);
    });
    /*-3- End */

    /*Experimental */
    $('#hehexd').on('click',function(){
        // console.log('hahaha');
        socket.emit('hehexd test', chatRoomConfig.targetID);
    })
    socket.on('chat test',function(name){
        console.log(name + " sent you a nudge!");
    })
    $('.friend-button').on('click',function(){
        console.log($(this).text());
        chatRoomConfig.targetID = $(this).text();
        $('#chat-friend').html('Target: '+chatRoomConfig.targetID);
    })

    //Control Panel Javascript
    //Searches for user
    $('#control-search-button').on('click',function(){
        $('#control-search-display').empty();
    })
    $('#control-search-form').submit(function () {
        // socket.emit('chat message', $('#control-search-field').val());
        socket.emit('control user search', $('#control-search-field').val());
        return false;
    });
    socket.on('control user search',function(username,status){
        // let sent = status=="sent"||status=="friends"?"control-friend-added":"control-friend-add";
        // let messageable = status=="friends"?"control-friend-message":"control-friend-message-no";
        // let result = username==='User not found'||username==='This is you'?`<span style="margin:0 auto;">${username}</span>`:`<span>${username}</span><div class="control-friend-button-group"><div class="${sent}"><i class="fa fa-plus"></i></div><div class="${status=="pending"?"control-friend-delete":messageable}"><i class="fa ${status=="pending"?"fa-times":"fa-comment"}"></i></div></div>`;
        let firstClass = status=="friends"?"control-friend-message":status=="sent"?"control-friend-added":"control-friend-add";
        let secondClass= status=="pending"||status=="friends"?"control-friend-delete":"control-friend-message-no";
        let firstIcon  = status=="friends"?"fa-comment":"fa-plus";
        let secondIcon = status=="pending"||status=="friends"?"fa-times":"fa-comment";
        let result = username==='User not found'||username==='This is you'?`<span style="margin:0 auto;">${username}</span>`:`<span>${username}</span><div class="control-friend-button-group"><div class="${firstClass}"><i class="fa ${firstIcon}"></i></div><div class="${secondClass}"><i class="fa ${secondIcon}"></i></div></div>`;
        $('#control-search-display').html(result);
    });
    $('body').on('click', '.control-friend-add', function(){
        // console.log($(this).parent().parent().children().text());
        let friendRequest = $(this).parent().parent().children().text();
        socket.emit('control friend request', friendRequest);
    })
    socket.on('control friend request',function(message){
        console.log(message);
    })
    $('body').on('click', '.control-friend-delete', function(){
        // console.log($(this).parent().parent().children().text());
        $('#control-search-display').empty();
        chatRoomConfig.deleteID = $(this).parent().parent().children().text();
        // console.log(chatRoomConfig.deleteID);
        //Empties chat messages and friend name
        if(chatRoomConfig.deleteID==chatRoomConfig.targetID){
            $('#chat-friend').empty();
            $('#chat-messages').empty();
        }
        socket.emit('control friend delete', chatRoomConfig.deleteID);
    })
    socket.on('control friend delete',function(message){
        $('#control-search-display').empty();
    })
    //Friends List Javascript
    socket.on('control friend list',function(pending, friends, offline){
        $('#control-friends-list').empty();
        for(var i in pending){
            $('#control-friends-list').append(`<li class="control-friend"><span class="control-friend-pending">${pending[i]}</span><div class="control-friend-button-group"><div class="control-friend-add"><i class="fa fa-plus"></i></div><div class="control-friend-delete"><i class="fa fa-times"></i></div></li>`);
        }
        for(var i in friends){
            $('#control-friends-list').append(`<li class="control-friend"><span class="control-friend-online">${friends[i]}</span><div class="control-friend-button-group"><div class="control-friend-message" user-message="${friends[i]}"><i class="fa fa-comment"></i></div><div class="control-friend-delete"><i class="fa fa-times"></i></div></li>`);
        }
        for(var i in offline){
            $('#control-friends-list').append(`<li class="control-friend"><span class="control-friend-offline">${offline[i]}</span><div class="control-friend-button-group"><div class="control-friend-message" user-message="${offline[i]}"><i class="fa fa-comment"></i></div><div class="control-friend-delete"><i class="fa fa-times"></i></div></li>`);
        }
        socket.emit('control retrieve unread messages', '');
    })
    socket.on('control retrieve unread messages', function(results){
        for(var i in results){
            $(`[user-message=${results[i]}]`).addClass('control-friend-message-unread');
        }
    })
    socket.on('control friend pending list',function(array){
        // $('#control-friends-pending-list').empty();
        // for(var i in array){
        //     $('#control-friends-pending-list').append(`<li class="control-friend"><span class="control-friend-online">${array[i]}</span><div class="control-friend-button-group"><div class="control-friend-message"><i class="fa fa-comment"></i></div><div class="control-friendlist-delete"><i class="fa fa-times"></i></div></li>`);
        // }
    })
    socket.on('control notify online friends',function(username){
        // console.log(username+" has just come online!");
        socket.emit('control request friends list', username);
    })
    //Chat Functionality Javascript
    // $('.friend-button').on('click',function(){
    //     console.log($(this).text());
    //     chatRoomConfig.targetID = $(this).text();
    //     $('#chat-friend').html('Target: '+chatRoomConfig.targetID);
    // })
    $('body').on('click','.control-friend-message',function(){
        $(this).removeClass('control-friend-message-unread');
        chatRoomConfig.targetID = $(this).parent().parent().children().text();
        $('#chat-friend').html(chatRoomConfig.targetID);
        socket.emit('control message target', chatRoomConfig.targetID);
        socket.emit('chat retrieve messages', chatRoomConfig.targetID);
    })
    //WebRTC JavaScript
    var localVideo;
    var remoteVideo;
    var peerConnection;
    var peerConnectionConfig = {'iceServers': [{'url': 'stu=[ppppppppppppppp:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};
    
    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    socket.on('message',function(stream){
        gotMessageFromServer(stream);
    })
    //Function to get webcam
    function grabWebCamVideo(){
        var constraints = {video: true,audio: true};
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
            localStream = stream;
            localVideo.srcObject = stream;
        }).catch(function(err){console.log(err)});
    }
    //Function to mute Video
    function muteWebCam(){
        if(localStream.getAudioTracks()[0].enabled){
            localStream.getAudioTracks()[0].enabled = false;
            // $('#mute').val('Unmute');
            $('.wrtc-button-mute').html('<i class="fa fa-microphone-slash"></i>');
        }
        else {
            localStream.getAudioTracks()[0].enabled = true;
            // $('#mute').val('Mute');
            $('.wrtc-button-mute').html('<i class="fa fa-microphone"></i>');
        }
    }
    function start(isCaller){
        console.log('start', isCaller);
        peerConnection = new RTCPeerConnection(peerConnectionConfig);
        peerConnection.onicecandidate = gotIceCandidate;
        peerConnection.onaddstream = gotRemoteStream;
        peerConnection.addStream(localStream);
        if(isCaller){
            peerConnection.createOffer(gotDescription, createOfferError);
        }
    }
    // console.log(start);
    function gotDescription(description){
        console.log('got description');
        peerConnection.setLocalDescription(description, function(){
            socket.emit('message', JSON.stringify({'sdp':description}));
        }, function(){console.log('set description error')});
    }
    function gotIceCandidate(event){
        if(event.candidate){
            socket.emit('message', JSON.stringify({'ice':event.candidate}));
        }
    }
    function gotRemoteStream(event){
        console.log('got remote stream');
        remoteVideo.srcObject = event.stream;
    }
    function createOfferError(error){
        console.log(error);
    }
    function gotMessageFromServer(message){
        if(!peerConnection) start(false);

        var signal = JSON.parse(message); //deprecated
        if(signal.sdp){
            peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp),function(){
                if(signal.sdp.type == 'offer'){
                    peerConnection.createAnswer(gotDescription, createOfferError);
                }
            });
        } else if(signal.ice){
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).then((e)=>{
                console.log('success');
            }).catch(e=>{console.log(e)});
        }
    }

    $('#start').on('click', function(){
        start(true);
    })
    $('.friend-button').on('click', function(){
        grabWebCamVideo();
    })
    
    $('body').on('click','.wrtc-button-start', function(){
        
    })
    $('body').on('click','.wrtc-button-mute', function(){
        muteWebCam();
    })
});
