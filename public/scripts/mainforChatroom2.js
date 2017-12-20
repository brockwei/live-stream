$(function () {
    var socket = io();
    var emailID = '';
    $('#chat-messages').append($('<li class="welcoming">').text('Welcome to the chatroom!'));
    function loadMessages(data, scrollH) {

        if (JSON.parse(data[0])["email"] == emailID) {
            $('#chat-messages').append($('<li>').html('<span class="currentUser">' + JSON.parse(data[0])["user"] + "</span> : " + JSON.parse(data[0])["msg"]));

        }
        else {
            $('#chat-messages').append($('<li>').text(JSON.parse(data[0])["user"] + " : " + JSON.parse(data[0])["msg"]));

        }
        if (scrollH < 0) {
            $('.chat-area').scrollTop($('#chat-messages')[0].scrollHeight);

        }
    }

    // $('#input-field').keypress(function (e) {
    //     if (e.which == 13) { //press the enter key
    //         $(this).blur();
    //         $('#datasend').focus().click();
    //     }
    // });

    $('form').submit(function () {
        if ($('#input-field').val() == "/clear") {
            $('#messages').empty();

        } else if ($('#input-field').val()) {
            socket.emit('chat message', $('#input-field').val());
            // console.log($('#input-field').val());
        }
        $('#input-field').val('');
        return false;
    });


//     //  Function to show a person is typing
//     $('#input-field').keypress(function() {
//         console.log('typing');
//        socket.emit('typing');
//    });

//    function debounce(fn, delay) {
//     var timer = null;
//     return function () {
//       var context = this, args = arguments;
//       clearTimeout(timer);
//       timer = setTimeout(function () {
//         fn.apply(context, args);
//       }, delay);
//     };
//   }

//    socket.on('typing', function(data) {
//        console.log('someone else typing');
//        $('#typing').html("<em>" + data + " is typing a message... </em>");
//    });

//    socket.on('typing', debounce( function(data){
//        console.log('typinggggg');
//         $('#typing').empty();
//    },2000));
 
    //socket io starts
    // socket.once('connect', function () {
    socket.on('connect', function () {
        // call the server-side function 'adduser' and send one parameter (value of prompt)
        socket.emit('chat adduser room', JSON.stringify({ username: prompt("What's your name?"), roomname: prompt("What's your room name?") }));

    });

    // listener, whenever the server emits 'updaterooms', this updates the room the client is in
    // socket.on('updaterooms', function (rooms, current_room) {
    //     $('#rooms').empty();
    //     $.each(rooms, function (key, value) {
    //         if (value == current_room) {
    //             $('#rooms').append('<div>' + value + '</div>');
    //         }
    //         else {
    //             $('#rooms').append('<div><a href="#" onclick="switchRoom(\'' + value + '\')">' + value + '</a></div>');
    //         }
    //     });
    // });

    // function switchRoom(room) {
    //     socket.emit('switchRoom', room);
    // }

    socket.once('chat history', function (data) {
        // $.fn.scrollBottom = function() { 
        //     return $(document).height() - this.scrollTop() - this.height(); 
        //   };

        data.forEach(dataElement => {
 
            $('#chat-messages').append($('<li>').html('<span class="currentUser">' + JSON.parse(dataElement)["user"] + "</span> : " + JSON.parse(dataElement)["msg"]));
        });

    })
    
    //('email id') save the email id received from the backend to emailID for the function loadMessages() to use
    socket.on('email id', function (data) {
        emailID = data;
        console.log('socketID' + emailID);
    });

    socket.on('user data', function (data) {

        $('#users').empty();

        $('#users').append($('<li>').text(`${data.length} user${data.length == 1 || 0 ? "" : "s"} in chat.`));


        data.forEach(data => {
            $('#users').append($('<li>').text(JSON.parse(data).username));

        });

    });

    socket.on('chat message', function (data) {
        // $('#typing').empty();
        //let scrollH = $('.chatArea').scrollTop();
        let scrollH = $('#chat-messages')[0].scrollHeight - $('.chat-area').scrollTop() - $('.chat-area')[0].clientHeight;
        //$('#messages').empty();
        loadMessages(data, scrollH);

    });


    socket.on('updatechat', function (username, data) {
        $('#chat-messages').append('<b>' + username + ':</b> ' + data + '<br>');
    });



    // $('#input-field').keypress(function (e) {
    //     if (e.which == 13) { //press the enter key
    //         $(this).blur();
    //         $('#datasend').focus().click();
    //     }
    // });
});