$(function () {
    var socket = io();
    var chatRoomConfig = {
        'username': '',
        'email'   : '',
        'targetID': ''
    }
    //"start of messages"
    $('#chat-messages').append($('<li class="welcoming">').text('Start of messages'));
    //function to load chatroom message history
    function loadMessages(data, scrollH) {
        if (JSON.parse(data[0])["email"] == chatRoomConfig.email) {
            $('#chat-messages').append($('<li>').html('<span class="currentUser">' + JSON.parse(data[0])["user"] + "</span> : " + JSON.parse(data[0])["msg"]));
        }
        else {
            $('#chat-messages').append($('<li>').text(JSON.parse(data[0])["user"] + " : " + JSON.parse(data[0])["msg"]));
        }
        if (scrollH < 0) {
            $('.chat-area').scrollTop($('#chat-messages')[0].scrollHeight);
        }
    }
    //Function to input messages in chatroom
    $('form').submit(function () {
        if ($('#input-field').val() == "/clear") {
            $('#messages').empty();
        } else if ($('#input-field').val()) {
            socket.emit('chat message', $('#input-field').val());
            console.log($('#input-field').val());
        }
        $('#input-field').val('');
        return false;
    });

    //Not needed: function to show online users in chat
    socket.on('user data', function (data) {
        $('#users').empty();
        $('#users').append($('<li>').text(`${data.numberOfUsers} user${data.numberOfUsers == 1 ? "" : "s"} in chat.`));
        for (var i in data.users) {
            $('#users').append($('<li>').text(data.users[i]));
        }
    });

    //On chat message, scrolls to the bottom of page
    socket.on('chat message', function (data) {
        let scrollH = $('#chat-messages')[0].scrollHeight - $('.chat-area').scrollTop() - $('.chat-area')[0].clientHeight;
        loadMessages(data, scrollH);
        console.log(JSON.parse(data));
        console.log(scrollH);
    });
    //Shows chat history
    socket.once('chat history', function (data) {
        data.forEach(dataElement => {
            $('#chat-messages').append($('<li>').html('<span class="currentUser">' + JSON.parse(dataElement)["user"] + "</span> : " + JSON.parse(dataElement)["msg"]));
        });
    })



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
        $('#control-username').html(data.username);
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



    //WebRTC JavaScript
    var localVideo;
    var remoteVideo;
    var peerConnection;
    var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};
    
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
            $('#mute').val('Unmute');
        }
        else {
            localStream.getAudioTracks()[0].enabled = true;
            $('#mute').val('Mute');
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

});
