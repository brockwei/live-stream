var desired_langs = {
    'auto': 'Automatic',
    'af': 'Afrikaans',
    'sq': 'Albanian',
    'am': 'Amharic',
    'ar': 'Arabic',
    'hy': 'Armenian',
    'az': 'Azerbaijani',
    'eu': 'Basque',
    'be': 'Belarusian',
    'bn': 'Bengali',
    'bs': 'Bosnian',
    'bg': 'Bulgarian',
    'ca': 'Catalan',
    'ceb': 'Cebuano',
    'ny': 'Chichewa',
    'zh-cn': 'Chinese Simplified',
    'zh-tw': 'Chinese Traditional',
    'co': 'Corsican',
    'hr': 'Croatian',
    'cs': 'Czech',
    'da': 'Danish',
    'nl': 'Dutch',
    'en': 'English',
    'eo': 'Esperanto',
    'et': 'Estonian',
    'tl': 'Filipino',
    'fi': 'Finnish',
    'fr': 'French',
    'fy': 'Frisian',
    'gl': 'Galician',
    'ka': 'Georgian',
    'de': 'German',
    'el': 'Greek',
    'gu': 'Gujarati',
    'ht': 'Haitian Creole',
    'ha': 'Hausa',
    'haw': 'Hawaiian',
    'iw': 'Hebrew',
    'hi': 'Hindi',
    'hmn': 'Hmong',
    'hu': 'Hungarian',
    'is': 'Icelandic',
    'ig': 'Igbo',
    'id': 'Indonesian',
    'ga': 'Irish',
    'it': 'Italian',
    'ja': 'Japanese',
    'jw': 'Javanese',
    'kn': 'Kannada',
    'kk': 'Kazakh',
    'km': 'Khmer',
    'ko': 'Korean',
    'ku': 'Kurdish (Kurmanji)',
    'ky': 'Kyrgyz',
    'lo': 'Lao',
    'la': 'Latin',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'lb': 'Luxembourgish',
    'mk': 'Macedonian',
    'mg': 'Malagasy',
    'ms': 'Malay',
    'ml': 'Malayalam',
    'mt': 'Maltese',
    'mi': 'Maori',
    'mr': 'Marathi',
    'mn': 'Mongolian',
    'my': 'Myanmar (Burmese)',
    'ne': 'Nepali',
    'no': 'Norwegian',
    'ps': 'Pashto',
    'fa': 'Persian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'ma': 'Punjabi',
    'ro': 'Romanian',
    'ru': 'Russian',
    'sm': 'Samoan',
    'gd': 'Scots Gaelic',
    'sr': 'Serbian',
    'st': 'Sesotho',
    'sn': 'Shona',
    'sd': 'Sindhi',
    'si': 'Sinhala',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'so': 'Somali',
    'es': 'Spanish',
    'su': 'Sundanese',
    'sw': 'Swahili',
    'sv': 'Swedish',
    'tg': 'Tajik',
    'ta': 'Tamil',
    'te': 'Telugu',
    'th': 'Thai',
    'tr': 'Turkish',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'uz': 'Uzbek',
    'vi': 'Vietnamese',
    'cy': 'Welsh',
    'xh': 'Xhosa',
    'yi': 'Yiddish',
    'yo': 'Yoruba',
    'zu': 'Zulu'
};

var translationTable = {
    'Afrikaans': 'Afrikaans',
    'Indonesian': 'Bahasa Indonesia',
    'Malay': 'Bahasa Melayu',
    'Catalan': 'Català',
    'Czech': 'Čeština',
    'German': 'Deutsch',
    'English': 'English',
    'Spanish': 'Español',
    'Basque': 'Euskara',
    'French': 'Français',
    'Galician': 'Galego',
    'Croatian': 'Hrvatski',
    'Zulu': 'IsiZulu',
    'Icelandic':'Íslenska',
    'Italian':'Italiano',
    'Hungarian':'Magyar',
    'Dutch':'Nederlands',
    'Polish':'Polski',
    'Portuguese':'Português',
    'Romanian':'Română',
    'Slovak':'Slovenčina',
    "Finnish":'Suomi',
    'Swedish':'Svenska',
    'Turkish':'Türkçe',
    'Bulgarian':'български',
    'Russian':'Pусский',
    'Serbian':'Српски',
    'Korean':'한국어',
    'Chinese':'中文',
    'Japanese':'日本語',
    'Latin':'Lingua latīna'
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}


$(function () {
    var socket = io();
    var chatRoomConfig = {
        'username': '',
        'email': '',
        'targetID': '',
        'deleteID': null,
        'groupChatRoom': null,
    }
    chatRoomConfig.clearChat = function () {
        $('#chat-call-friend').remove();
        $('#right-group').hide();
        $('#chat-friend').empty();
        $('#chat-field').parent().addClass('chat-field-hidden');
        $('#chat-messages').empty();
        $('#chat-messages').html(`<br><li style="color:black;">Welcome to Go Chat instant messenging app!</li>`);
    }
    //Special
    $('#special-form').submit(function () {
        // socket.emit('chat message', $('#control-search-field').val());
        socket.emit('config submit username', $('#special-username').val());
        return false;
    });
    /*-4- Require username*/
    socket.on('config require username', function () {
        $('#special-correction').show();
    })
    /*-5- Require username*/
    socket.on('config require username failed', function () {
        // $('#special-correction').show();
        $('#special-username-taken').html('Username unavailable')
    })
    /*-6- */
    socket.on('config oauth username created', function (username) {
        socket.emit('config oauth username created', username);
        $('#special-correction').hide();
    })
    //"start of messages"
    //Chatroom Javascript
    // $('#chat-messages').append($('<li class="welcoming">').text(`Welcome to Go Chat web app`));
    //Send chat message on form submit
    $('#chat-field').submit(function () {
        if ($('#input-field').val() && chatRoomConfig.groupChatRoom == null) {
            socket.emit('chat message', $('#input-field').val(), chatRoomConfig.targetID);
        }
        else {
            socket.emit('group chat message', $('#input-field').val());
        }
        $('#input-field').val('');
        return false;
    });
    //Load message function
    chatRoomConfig.loadMessages = function (message, scrollH) {
        $('#chat-messages').empty();
        for (var i in message) {
            if (message[i].type == "to") {
                $('#chat-messages').append($('<li class="chat-message chat-message-sent">').html(`<span style="font-weight:700;" class='chat-message-username'>${message[i].username}</span><br>${message[i].message}`));
            }
            else if (message[i].type == "read") {
                $('#chat-messages').append($('<li class="chat-message chat-message-read">').html(`<span style="font-weight:700;" class='chat-message-friend'>${message[i].friend}</span><br>${message[i].message}`));
            }
            else if (message[i].type == "from") {
                $('#chat-messages').append($('<li class="chat-message chat-message-unread">').html(`<span style="font-weight:700;" class='chat-message-friend'>${message[i].friend}</span><br>${message[i].message}`));
            }
            //Scrolls to the bottom of the page
            // if (scrollH < 0) {
            if ($('.chat-message').last().offset().top < 700) {
                // $('.chat-area').scrollTop($('#chat-messages')[0].scrollHeight);
                $('.chat-area').scrollTop(0);
                $('.chat-area').scrollTop($('.chat-message').last().offset().top);
            }
        }
    }
    //Recieve chat log from backend
    socket.on('chat message', function (message, friend) {
        let scrollH = $('#chat-messages')[0].scrollHeight - $('.chat-area').scrollTop() - $('.chat-area')[0].clientHeight;
        // console.log()
        // if(message[0].friend==chatRoomConfig.targetID){
        if (friend == chatRoomConfig.targetID) {
            let promise = new Promise((res, rej) => {
                chatRoomConfig.loadMessages(message, scrollH);
                res();
            });
            promise.then((err) => {
                socket.emit('chat message read', chatRoomConfig.targetID);
            })

        }
        else {
            $(`[user-message=${friend}]`).addClass('control-friend-message-unread');
        }
        // $('#right-group').hide();
        // if(peerConnection){
        //     peerConnection.close();
        // }
    })

    //  Function to show a person is typing
    $('#input-field').keypress(function () {
        // console.log('typing');
        socket.emit('typing', chatRoomConfig.targetID);
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

    socket.on('typing', function (username) {
        // console.log('someone else typing');
        console.log(chatRoomConfig.targetID + ":" + username);
        if (chatRoomConfig.targetID == username) {
            $('#typing').html(" &nbsp; <em>  is typing a message... </em>");
        }
    });

    socket.on('typing', debounce(function (data) {
        console.log('typinggggg');
        $("#typing").empty();
    }, 2000));

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
        $('#control-username').html(data.username + `&nbsp&nbsp<a href="/logout"><i class="fa fa-sign-out"></i></a>`);
    });
    /*-3- End */

    //Control Panel Javascript
    //Searches for user
    $('#control-search-button').on('click', function () {
        $('#control-search-display').empty();
    })
    $('#control-search-form').submit(function () {
        // socket.emit('chat message', $('#control-search-field').val());
        socket.emit('control user search', $('#control-search-field').val());
        return false;
    });
    socket.on('control user search', function (username, status) {
        // let sent = status=="sent"||status=="friends"?"control-friend-added":"control-friend-add";
        // let messageable = status=="friends"?"control-friend-message":"control-friend-message-no";
        // let result = username==='User not found'||username==='This is you'?`<span style="margin:0 auto;">${username}</span>`:`<span>${username}</span><div class="control-friend-button-group"><div class="${sent}"><i class="fa fa-plus"></i></div><div class="${status=="pending"?"control-friend-delete":messageable}"><i class="fa ${status=="pending"?"fa-times":"fa-comment"}"></i></div></div>`;
        let firstClass = status == "friends" ? "control-friend-message" : status == "sent" ? "control-friend-added" : "control-friend-add";
        let secondClass = status == "pending" || status == "friends" ? "control-friend-delete" : "control-friend-message-no";
        let firstIcon = status == "friends" ? "fa-comment" : "fa-user-plus";
        let secondIcon = status == "pending" || status == "friends" ? "fa-times" : "fa-comment";
        let result = username === 'User not found' || username === 'This is you' ? `<span style="color:rgb(255, 77, 77);margin:0 auto;">${username}</span>` : `<span>${username}</span><div class="control-friend-button-group"><div class="${firstClass}"><i class="fa ${firstIcon}"></i></div><div class="${secondClass}"><i class="fa ${secondIcon}"></i></div></div>`;
        $('#control-search-display').html(result);
    });
    $('body').on('click', '.control-friend-add', function () {
        // console.log($(this).parent().parent().children().text());
        let friendRequest = $(this).parent().parent().children().text();
        socket.emit('control friend request', friendRequest);
    })
    socket.on('control friend request', function (message) {
        console.log(message);
    })
    $('body').on('click', '.control-friend-delete', function () {
        // console.log($(this).parent().parent().children().text());
        $('#control-search-display').empty();
        chatRoomConfig.deleteID = $(this).parent().parent().children().text();
        // console.log(chatRoomConfig.deleteID);
        //Empties chat messages and friend name
        if (chatRoomConfig.deleteID == chatRoomConfig.targetID) {
            chatRoomConfig.clearChat();
        }
        socket.emit('control friend delete', chatRoomConfig.deleteID);
        // 
    })
    socket.on('control friend delete', function (message) {
        $('#control-search-display').empty();
        if (message == chatRoomConfig.targetID) {
            chatRoomConfig.clearChat();
        }
    })
    //Friends List Javascript
    socket.on('control friend list', function (pending, friends, offline) {
        $('#control-friends-list').empty();
        for (var i in pending) {
            $('#control-friends-list').append(`<li class="control-friend"><span class="control-friend-pending">${pending[i]}</span><div class="control-friend-button-group"><div class="control-friend-add"><i class="fa fa-user-plus"></i></div><div class="control-friend-delete"><i class="fa fa-times"></i></div></li>`);
        }
        for (var i in friends) {
            $('#control-friends-list').append(`<li class="control-friend"><span class="control-friend-online">${friends[i]}</span><div class="control-friend-button-group"><div class="control-friend-message" user-message="${friends[i]}"><i class="fa fa-comment"></i></div><div class="control-friend-delete"><i class="fa fa-times"></i></div></li>`);
            if (friends[i] == chatRoomConfig.targetID) {
                $('#chat-friend').html(`<div>@${chatRoomConfig.targetID}&nbsp&nbsp<span id="mobile-return"><i class="fa fa-sign-out"></i></span><span id="typing"></span></div> <div id="chat-call-friend"><i class="fa fa-video-camera"></i></div>`);
            }
        }
        for (var i in offline) {
            $('#control-friends-list').append(`<li class="control-friend"><span class="control-friend-offline">${offline[i]}</span><div class="control-friend-button-group"><div class="control-friend-message" user-message="${offline[i]}"><i class="fa fa-comment"></i></div><div class="control-friend-delete"><i class="fa fa-times"></i></div></li>`);
            if (offline[i] == chatRoomConfig.targetID) {
                $('#chat-call-friend').remove();
                $('#right-group').hide();
            }
        }
        socket.emit('control retrieve unread messages', '');
    })
    socket.on('control retrieve unread messages', function (results) {
        for (var i in results) {
            $(`[user-message=${results[i]}]`).addClass('control-friend-message-unread');
        }
    })
    socket.on('control notify online friends', function (username) {
        // console.log(username+" has just come online!");
        socket.emit('control request friends list', username);
    })
    //Chat Functionality Javascript
    $('body').on('click', '.control-friend-message', function () {
        // grabWebCamVideo();chat-call-friend
        $(this).removeClass('control-friend-message-unread');
        chatRoomConfig.targetID = $(this).parent().parent().children().text();
        $('#chat-friend').html(`@${chatRoomConfig.targetID}` + '<span id="typing"> </span>');
        if ($(this).parent().parent().children().hasClass('control-friend-online') && !!window.chrome) {
            $('#chat-friend').html(`<div>@${chatRoomConfig.targetID}&nbsp&nbsp<span id="mobile-return"><i class="fa fa-sign-out"></i></span><span id="typing"></span></div> <div id="chat-call-friend"><i class="fa fa-video-camera"></i></div>`);
        }
        // else if($(this).parent().parent().children().hasClass('control-friend-offline')){
        else {
            $('#chat-friend').html(`<div>@${chatRoomConfig.targetID}&nbsp&nbsp<span id="mobile-return"><i class="fa fa-sign-out"></i></span><span id="typing"></span></div>`);
        }
        socket.emit('control message target', chatRoomConfig.targetID);
        socket.emit('chat retrieve messages', chatRoomConfig.targetID);
        // 
        chatRoomConfig.groupChatRoom = null;
        $('#chat-ggroup').addClass('mobile-show');
        $('.control-friend').removeClass('control-message-highlighted');
        $('.control-group').removeClass('control-message-highlighted');
        $(this).parent().parent().addClass('control-message-highlighted');
        $('#chat-field').parent().removeClass('chat-field-hidden');
    })
    //WebRTC JavaScript
    var localVideo;
    var remoteVideo;
    var peerConnection;
    var peerConnectionConfig = { 'iceServers': [{ 'url': 'stun:stun.services.mozilla.com' }, { 'url': 'stun:stun.l.google.com:19302' }] };

    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    socket.on('message', function (stream) {
        // console.log('what');
        gotMessageFromServer(stream);
    })
    //Function to get webcam
    function grabWebCamVideo() {
        var constraints = { video: true, audio: true };
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            localStream = stream;
            localVideo.srcObject = stream;
        }).catch(function (err) { console.log(err) });
    }
    //Function to mute Video
    function muteWebCam() {
        if (localStream.getAudioTracks()[0].enabled) {
            localStream.getAudioTracks()[0].enabled = false;
            // $('#mute').val('Unmute');
            $('.wrtc-button-mute').html('<i class="fa fa-microphone-slash fa-2x"></i>');
        }
        else {
            localStream.getAudioTracks()[0].enabled = true;
            // $('#mute').val('Mute');
            $('.wrtc-button-mute').html('<i class="fa fa-microphone fa-2x"></i>');
        }
    }
    function start(isCaller) {
        // console.log('start', isCaller);
        console.log('step 3' + chatRoomConfig.username);
        peerConnection = new RTCPeerConnection(peerConnectionConfig);
        peerConnection.onicecandidate = gotIceCandidate;
        peerConnection.onaddstream = gotRemoteStream;
        peerConnection.addStream(localStream);
        if (isCaller) {
            peerConnection.createOffer(gotDescription, createOfferError);
        }
    }
    // console.log(start);
    function gotDescription(description) {
        console.log('got description');
        peerConnection.setLocalDescription(description, function () {
            socket.emit('message', JSON.stringify({ 'sdp': description }), chatRoomConfig.videoTargetID);
        }, function () { console.log('set description error') });
    }
    function gotIceCandidate(event) {
        if (event.candidate) {
            socket.emit('message', JSON.stringify({ 'ice': event.candidate }), chatRoomConfig.videoTargetID);
        }
    }
    function gotRemoteStream(event) {
        console.log('got remote stream');
        remoteVideo.srcObject = event.stream;
    }
    function createOfferError(error) {
        console.log(error);
    }
    function gotMessageFromServer(message) {
        console.log('step 7');
        if (!peerConnection) start(false);

        var signal = JSON.parse(message); //deprecated
        if (signal.sdp) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function () {
                if (signal.sdp.type == 'offer') {
                    peerConnection.createAnswer(gotDescription, createOfferError);
                }
            });
        } else if (signal.ice) {
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).then((e) => {
                console.log('success');
            }).catch(e => { console.log(e) });
        }
    }

    $('#start').on('click', function () {
        start(true);
    })
    $('.friend-button').on('click', function () {
        grabWebCamVideo();
    })



    // $('#start').on('click', function(){
    //     start(true);
    // })
    // $('.friend-button').on('click', function(){
    //     grabWebCamVideo();
    // })

    //zzzzEXPERIMENT
    $('body').on('click', '.wrtc-button-start', () => {
        $('#wrtc-special-call-container').fadeIn();
        $('#wrtc-special-call').html(`<div style="height:100%;display:flex;flex-direction:column;justify-content:space-between;"><div>Calling <strong style="color:greenyellow;">${chatRoomConfig.targetID}</strong>...</div><div class="wrtc-button wrtc-cancel-video-request" style="background:red;margin:0 auto;"><i class="fa fa-times fa-2x"></i></div></div>`)
        chatRoomConfig.videoTargetID = chatRoomConfig.targetID;
        socket.emit('wrtc send video request', chatRoomConfig.targetID);
        $('.wrtc-button-start').hide();
    })
    $('body').on('click', '.wrtc-cancel-video-request', function () {
        socket.emit('wrtc cancel video request', chatRoomConfig.videoTargetID);
        $('#wrtc-special-call-container').fadeOut();
        $('.wrtc-button-start').show();
    })
    //lionheart
    //Function to get webcam
    function grabWebCamVideo2(resolve, reject) {
        var constraints = { video: true, audio: true };
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            localStream = stream;
            localVideo.srcObject = stream;
            resolve(stream);
        }).catch(function (err) {
            reject(err);
            console.log('error');
        });
    }
    $('body').on('click', '.wrtc-accept-video-request', function () {

        let promise = new Promise((resolve, reject) => {
            grabWebCamVideo2(resolve, reject);
            $('.wrtc-button-start').hide();
            $('#right-group').show();
            if (peerConnection) {
                peerConnection.close();
            }
            $('#chat-call-friend').toggleClass('control-message-highlighted');
            // resolve();
        });
        promise.then((localStream) => {
            chatRoomConfig.targetID = chatRoomConfig.videoTargetID;
            // console.log(chatRoomConfig.videoTargetID);

            $('#chat-friend').html(`@${chatRoomConfig.videoTargetID}` + '<span id="typing"> </span>');
            if ($(`[user-message="${chatRoomConfig.videoTargetID}"]`).parent().parent().children().hasClass('control-friend-online') && !!window.chrome) {
                $('#chat-friend').html(`<div>@${chatRoomConfig.videoTargetID}&nbsp&nbsp<span id="mobile-return"><i class="fa fa-sign-out"></i></span><span id="typing"></span></div> <div id="chat-call-friend"><i class="fa fa-video-camera"></i></div>`);
            }
            // else if($(this).parent().parent().children().hasClass('control-friend-offline')){
            else {
                $('#chat-friend').html(`<div>@${chatRoomConfig.videoTargetID}&nbsp&nbsp<span id="mobile-return"><i class="fa fa-sign-out"></i></span><span id="typing"></span></div>`);
            }

            chatRoomConfig.groupChatRoom = null;
            $('#chat-ggroup').addClass('mobile-show');
            $('.control-friend').removeClass('control-message-highlighted');
            $('.control-group').removeClass('control-message-highlighted');
            $(`[user-message="${chatRoomConfig.videoTargetID}"]`).parent().parent().addClass('control-message-highlighted');
            $('#chat-field').parent().removeClass('chat-field-hidden');
            socket.emit('control message target', chatRoomConfig.videoTargetID);
            socket.emit('chat retrieve messages', chatRoomConfig.videoTargetID);
            $('#chat-call-friend').toggleClass('control-message-highlighted');
            socket.emit('wrtc connection accepted', chatRoomConfig.videoTargetID);
            socket.emit('wrtc connection request', chatRoomConfig.videoTargetID);
            $('#wrtc-special-call-container').fadeOut();
        }).catch(e => {
            console.log(e);
        })

        // socket.emit('control message target', chatRoomConfig.videoTargetID);
        // socket.emit('chat retrieve messages', chatRoomConfig.videoTargetID);
        // // 
        // chatRoomConfig.groupChatRoom = null;
        // $('#chat-ggroup').addClass('mobile-show');
        // $('.control-friend').removeClass('control-message-highlighted');
        // $('.control-group').removeClass('control-message-highlighted');
        // $(`[user-message="${chatRoomConfig.videoTargetID}"]`).parent().parent().addClass('control-message-highlighted');
        // $('#chat-field').parent().removeClass('chat-field-hidden');
        // // 

    })
    socket.on('wrtc send video request', function (username) {
        chatRoomConfig.videoTargetID = username;
        $('#wrtc-special-call-container').fadeIn();
        $('#wrtc-special-call').html(`<div style="height:100%;display:flex;flex-direction:column;justify-content:space-between;"><div><strong style="color:greenyellow;">${username}</strong> is calling you!</div><div style="display:flex;"><div class="wrtc-button wrtc-accept-video-request" style="background:red;margin:0 auto;"><i class="fa fa-phone fa-2x"></i></div>&nbsp&nbsp&nbsp<div class="wrtc-button wrtc-cancel-video-request" style="background:red;margin:0 auto;"><i class="fa fa-times fa-2x"></i></div></div></div>`)
    })
    socket.on('wrtc cancel video request', function () {
        $('#wrtc-special-call-container').fadeOut();
        $('.wrtc-button-start').show();
    })
    socket.on('wrtc connection accepted', function () {
        $('#wrtc-special-call-container').fadeOut();
    });
    // $('body').on('click','.wrtc-button-start', function(){

    //     socket.emit('wrtc connection request', chatRoomConfig.targetID);
    // })
    socket.on('wrtc connection request', function (placeholder) {
        console.log('step 2');
        start(true);
    })
    $('body').on('click', '.wrtc-button-mute', function () {
        muteWebCam();
    })
    $('body').on('click', '.wrtc-button-stop', function () {
        if (peerConnection) {
            peerConnection.close();
        }
    })
    //Webcam Basic Javascript
    $('body').on('click', '#chat-call-friend', function () {
        $('.wrtc-button-start').show();
        grabWebCamVideo();
        $('#right-group').slideToggle('fast');
        if (peerConnection) {
            peerConnection.close();
        }
        $('#chat-call-friend').toggleClass('control-message-highlighted');
    })

    $('body').on('click', '#control-group-create', function () {
        chatRoomConfig.groupChatRoom = prompt('Join Chat Room:');
        if (chatRoomConfig.groupChatRoom != null) {
            let data = JSON.stringify({ username: chatRoomConfig.username, roomname: chatRoomConfig.groupChatRoom });
            socket.emit('control group add user', data);
            $('#chat-messages').empty();
            $('.control-group').removeClass('control-message-highlighted');
            $('#control-groupchat-list').append(`<li class="control-group control-message-highlighted"><span class="control-friend-pending">${chatRoomConfig.groupChatRoom}</span><div class="control-friend-button-group"><div class="control-group-message"><i class="fa fa-comment"></i></div><div class="control-group-delete"><i class="fa fa-times"></i></div></li>`)
            $('#chat-ggroup').addClass('mobile-show');

            $('.control-friend').removeClass('control-message-highlighted');
            $('#chat-friend').html(`<div><span id="mobile-return"><i class="fa fa-sign-out"></i></span></div>`);
            // 
            $('#chat-field').parent().removeClass('chat-field-hidden');
        }
    })
    // Group chat Javascript
    chatRoomConfig.loadGroupMessages = function (data, scrollH) {
        // console.log(JSON.parse(data[0]));

        if (JSON.parse(data[0])["user"] == chatRoomConfig.username) {
            $('#chat-messages').append($('<li class="chat-message chat-message-sent">').html(`<span class='chat-message-username'>${JSON.parse(data[0])["user"]}</span><br>${JSON.parse(data[0])["msg"]}`));
        }
        else if (JSON.parse(data[0])["user"] != chatRoomConfig.username) {
            $('#chat-messages').append($('<li class="chat-message chat-message-read">').html(`<span class='chat-message-friend'>${JSON.parse(data[0])["user"]}</span><br>${JSON.parse(data[0])["msg"]}`));
        }
        if ($('.chat-message').last().offset().top < 700) {
            // $('.chat-area').scrollTop($('#chat-messages')[0].scrollHeight);
            $('.chat-area').scrollTop(0);
            $('.chat-area').scrollTop($('.chat-message').last().offset().top);
        }
    }

    $('body').on('click', '.control-group-delete', function () {
        // console.log($(this).parent().parent().children().text());
        // $('#control-search-display').empty();
        chatRoomConfig.deleteID = $(this).parent().parent().children().text();
        $(this).parent().parent().remove();
        //Empties chat messages and friend name
        if (chatRoomConfig.deleteID == chatRoomConfig.groupChatRoom) {
            $('#chat-friend').empty();
            $('#chat-messages').empty();
        }
        chatRoomConfig.groupChatRoom = null;
        // 

        $('#chat-messages').html(`<br><li style="color:black;">Welcome to Go Chat instant messenging app!</li>`);
        $('#chat-field').parent().addClass('chat-field-hidden');
    })
    $('body').on('click', '.control-group-message', function () {
        // console.log($(this).parent().parent().children().text());
        chatRoomConfig.groupChatRoom = $(this).parent().parent().children().text();
        let data = JSON.stringify({ username: chatRoomConfig.username, roomname: chatRoomConfig.groupChatRoom });
        socket.emit('control group add user', data);
        $('#chat-messages').empty();
        $('#chat-friend').empty();
        $('#chat-ggroup').addClass('mobile-show');
        $('#chat-friend').html(`<div><span id="mobile-return"><i class="fa fa-sign-out"></i></span></div>`);
        $('.control-friend').removeClass('control-message-highlighted');
        $('.control-group').removeClass('control-message-highlighted');
        $(this).parent().parent().addClass('control-message-highlighted');
        // 
        $('#chat-field').parent().removeClass('chat-field-hidden');
    })

    //Copy Paste:
    socket.on('group chat history', function (data) {
        data.forEach(dataElement => {
            // $('#chat-messages').append($('<li>').html('<span class="currentUser">' + JSON.parse(dataElement)["user"] + "</span> : " + JSON.parse(dataElement)["msg"]));
            if (JSON.parse(dataElement)["user"] == chatRoomConfig.username) {
                $('#chat-messages').append($('<li class="chat-message chat-message-sent">').html(`<span class='chat-message-username'>${JSON.parse(dataElement)["user"]}</span><br>${JSON.parse(dataElement)["msg"]}`));
            }
            else if (JSON.parse(dataElement)["user"] != chatRoomConfig.username) {
                $('#chat-messages').append($('<li class="chat-message chat-message-read">').html(`<span class='chat-message-friend'>${JSON.parse(dataElement)["user"]}</span><br>${JSON.parse(dataElement)["msg"]}`));
            }
            if ($('.chat-message').last().offset().top < 700) {
                // $('.chat-area').scrollTop($('#chat-messages')[0].scrollHeight);
                $('.chat-area').scrollTop($('.chat-message').last().offset().top + 1000);
            }
        });
    })

    socket.on('group chat message', function (data) {
        let scrollH = $('#chat-messages')[0].scrollHeight - $('.chat-area').scrollTop() - $('.chat-area')[0].clientHeight;
        chatRoomConfig.loadGroupMessages(data, scrollH);
    });
    socket.on('updatechat', function (username, data) {
        $('#chat-messages').append('<b>' + username + ':</b> ' + data + '<br>');
    });

    $('body').on('click', '#mobile-return', function () {
        $('#chat-ggroup').removeClass('mobile-show');
    })

    //send result to the server
    recognition.onresult = function (event) {
        var interim_transcript = '';
        var final_transcript = '';

        // main for loop for final and interim results
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;


                socket.emit('video interim message', final_transcript, chatRoomConfig.targetID);
            } else {
                interim_transcript += event.results[i][0].transcript;
                socket.emit('video voice final message', interim_transcript, chatRoomConfig.targetID);
            }
        }
        interim_span.innerHTML = interim_transcript;
        final_span.innerHTML = final_transcript;
    };

    socket.on('video voice interim remote message', function (message) {
        $('#interim_span_remote').html(message);
    })

    socket.on('video voice final remote message', function (message) {
        $('#final_span_remote').html(message);
    })

    // socket.on('video voice desired lang pref', function () {
    //     var desiredLanguage = $('#desiredlanguage').val();
    //     var key = getKeyByValue(desired_langs, desiredLanguage);
    //     console.log('desired lang code ' + key);
    //     socket.emit('desired lang code', desiredLanguage)
    // })

    $('#desiredlanguage').on('change', function () {
        console.log('changegegegegege')
        // socket.on('video voice desire lang', function () {
        // var desiredLanguage = $('#desiredlanguage').val();
        var key = getKeyByValue(translationTable, $('#desiredlanguage option:selected').text());
        console.log('keyyeee ' + key)
        key = getKeyByValue(desired_langs, key);
        console.log('desired lang code ' + key);
        socket.emit('video voice desired lang key', key)
    })
    // })
});
