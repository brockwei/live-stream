$(function () {
    var socket = io();
    var emailID = '';
    $('#chat-messages').append($('<li class="welcoming">').text('Welcome to the chatroom!'));
    function loadMessages(data, scrollH) {
        // console.log('dsdadadasd')
        // console.log(JSON.parse(data[0])['email'] + emailID)
        if (JSON.parse(data[0])["email"] == emailID) {
            $('#chat-messages').append($('<li>').html('<span class="currentUser">' + JSON.parse(data[0])["user"] + "</span> : " + JSON.parse(data[0])["msg"]));
            // console.log('data[0][email]')
            // console.log(data)
        }
        else {
            $('#chat-messages').append($('<li>').text(JSON.parse(data[0])["user"] + " : " + JSON.parse(data[0])["msg"]));
            // console.log('data[0][email]2')
            // console.log(data)

        }
        if (scrollH < 0) {
            $('.chat-area').scrollTop($('#chat-messages')[0].scrollHeight);
            // console.log('data[0][email]3')
            // console.log(data)
        }
    }

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

    socket.on('email id', function (data) {
        emailID = data;
        console.log('socketID' + emailID);
    });

    socket.on('user data', function (data) {
        //console.log(data);
        // $('.userNumber').html(data.numberOfUsers);
        $('#users').empty();
        $('#users').append($('<li>').text(`${data.numberOfUsers} user${data.numberOfUsers == 1 ? "" : "s"} in chat.`));
        for (var i in data.users) {
            $('#users').append($('<li>').text(data.users[i]));
        }
    });

    socket.on('chat message', function (data) {
        // console.log('datatattattatatatta')
        // console.log(JSON.parse(data));
        //let scrollH = $('.chatArea').scrollTop();
        let scrollH = $('#chat-messages')[0].scrollHeight - $('.chat-area').scrollTop() - $('.chat-area')[0].clientHeight;
        //$('#messages').empty();
        loadMessages(data, scrollH);
        console.log(JSON.parse(data));
        console.log(scrollH);
    });

    socket.once('chat history', function (data) {
        // $.fn.scrollBottom = function() { 
        //     return $(document).height() - this.scrollTop() - this.height(); 
        //   };

        // console.log('chat history')
        // console.log('chat history'+data);
        // console.log(emailID)
        data.forEach(dataElement => {
            // if (dataElement["email"] == emailID) {
            // console.log('dataElemenetntnntntnt')
            $('#chat-messages').append($('<li>').html('<span class="currentUser">' + JSON.parse(dataElement)["user"] + "</span> : " + JSON.parse(dataElement)["msg"]));
            // }
        });
        // $('.chat-area').scrollBottom()
    })

    
    $('#input-field').keypress(function(e) {
        if(e.which == 13) { //press the enter key
            $(this).blur();
            $('#datasend').focus().click();
        }
    });
    // $('#chat-messages').animate({
    //     scrollTop: $('#chat-scroll').get(0).scrollHeight
    // }, 2000);
    // var objDiv = document.getElementById("#chat-messages")[0];
    // objDiv.scrollTop = objDiv.scrollHeight;
});
