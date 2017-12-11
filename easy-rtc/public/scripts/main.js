var localVideo;
var remoteVideo;
var peerConnection;
var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

function pageReady() {
    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    // serverConnection = new WebSocket('ws://127.0.0.1:3434');
    // serverConnection.onmessage = gotMessageFromServer;
    var socket = io();
    // socket.onmessage = gotMessageFromServer;
    socket.on('message',function(stream){
        gotMessageFromServer(stream);
    })

    var constraints = {
        video: true,
        audio: true
    };
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
        localStream = stream;
        // localVideo.src = window.URL.createObjectURL(stream);
        localVideo.srcObject = stream;
    }).catch(function(err){console.log(err)});

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
            socket.send(JSON.stringify({'sdp':description}));
        }, function(){console.log('set description error')});
    }
    function gotIceCandidate(event){
        if(event.candidate){
            socket.send(JSON.stringify({'ice':event.candidate}));
        }
    }
    function gotRemoteStream(event){
        console.log('got remote stream');
        // remoteVideo.src = window.URL.createObjectURL(event.stream);
        remoteVideo.srcObject = event.stream;
    }
    function createOfferError(error){
        console.log(error);
    }
    function gotMessageFromServer(message){
        console.log(message);
        if(!peerConnection) start(false);

        var signal = JSON.parse(message);
        if(signal.sdp){
            peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp),function(){
                if(signal.sdp.type == 'offer'){
                    peerConnection.createAnswer(gotDescription, createOfferError);
                }
            });
        } else if(signal.ice){
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
        }
    }
    $('#start').on('click', function(){
        start(true);
    })
}