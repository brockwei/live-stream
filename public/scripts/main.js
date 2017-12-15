var localVideo;
var remoteVideo;
var peerConnection;
var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

function pageReady() {
    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    var socket = io.connect();

    socket.on('message',function(stream,test){
        console.log(test)
        gotMessageFromServer(stream);
    })

    function grabWebCamVideo(){
        var constraints = {
            video: true,
            audio: true
        };
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
            localStream = stream;
            // localVideo.src = window.URL.createObjectURL(stream); //deprecated
            localVideo.srcObject = stream;
        }).catch(function(err){console.log(err)});
    }
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
            // socket.send(JSON.stringify({'sdp':description}));
            socket.emit('message', JSON.stringify({'sdp':description}));
        }, function(){console.log('set description error')});
    }
    function gotIceCandidate(event){
        if(event.candidate){
            // socket.send(JSON.stringify({'ice':event.candidate}));
            socket.emit('message', JSON.stringify({'ice':event.candidate}));
        }
    }
    function gotRemoteStream(event){
        console.log('got remote stream');
        // remoteVideo.src = window.URL.createObjectURL(event.stream);  //deprecated
        remoteVideo.srcObject = event.stream;
    }
    function createOfferError(error){
        console.log(error);
    }
    function gotMessageFromServer(message){
        // console.log(message);
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
    $('#stop').on('click', function(){
        if(peerConnection){
            peerConnection.close();
        }
    })
    $('#mute').on('click',function(){
        muteWebCam();
    })
    /*TEST */
    // let room = window.location.pathname.replace('/','');
    // socket.emit('create or join', room);
    // socket.on('full',function(room){
    //     console.log(`room is full`);
    //     //socket.disconnect();
    //     window.location.href = "/";
    // });
    // socket.on('created',function(room,clientID){
    //     console.log(`Created ${room} - my client ID is ${clientID}`);
    //     grabWebCamVideo();
    // })
    // socket.on('joined',function(room,clientID){
    //     console.log(`Joined ${room} - my client ID is ${clientID}`);
    //     grabWebCamVideo();
    // })
}