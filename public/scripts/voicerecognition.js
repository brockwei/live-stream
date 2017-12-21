var langs =
    [['Afrikaans', ['af-ZA']],
    ['Bahasa Indonesia', ['id-ID']],
    ['Bahasa Melayu', ['ms-MY']],
    ['Català', ['ca-ES']],
    ['Čeština', ['cs-CZ']],
    ['Deutsch', ['de-DE']],
    ['English', ['en-AU', 'Australia'],
        ['en-CA', 'Canada'],
        ['en-IN', 'India'],
        ['en-NZ', 'New Zealand'],
        ['en-ZA', 'South Africa'],
        ['en-GB', 'United Kingdom'],
        ['en-US', 'United States']],
    ['Español', ['es-AR', 'Argentina'],
        ['es-BO', 'Bolivia'],
        ['es-CL', 'Chile'],
        ['es-CO', 'Colombia'],
        ['es-CR', 'Costa Rica'],
        ['es-EC', 'Ecuador'],
        ['es-SV', 'El Salvador'],
        ['es-ES', 'España'],
        ['es-US', 'Estados Unidos'],
        ['es-GT', 'Guatemala'],
        ['es-HN', 'Honduras'],
        ['es-MX', 'México'],
        ['es-NI', 'Nicaragua'],
        ['es-PA', 'Panamá'],
        ['es-PY', 'Paraguay'],
        ['es-PE', 'Perú'],
        ['es-PR', 'Puerto Rico'],
        ['es-DO', 'República Dominicana'],
        ['es-UY', 'Uruguay'],
        ['es-VE', 'Venezuela']],
    ['Euskara', ['eu-ES']],
    ['Français', ['fr-FR']],
    ['Galego', ['gl-ES']],
    ['Hrvatski', ['hr_HR']],
    ['IsiZulu', ['zu-ZA']],
    ['Íslenska', ['is-IS']],
    ['Italiano', ['it-IT', 'Italia'],
        ['it-CH', 'Svizzera']],
    ['Magyar', ['hu-HU']],
    ['Nederlands', ['nl-NL']],
    // ['Norsk bokmål', ['nb-NO']],
    ['Polski', ['pl-PL']],
    ['Português', ['pt-BR', 'Brasil'],
        ['pt-PT', 'Portugal']],
    ['Română', ['ro-RO']],
    ['Slovenčina', ['sk-SK']],
    ['Suomi', ['fi-FI']],
    ['Svenska', ['sv-SE']],
    ['Türkçe', ['tr-TR']],
    ['български', ['bg-BG']],
    ['Pусский', ['ru-RU']],
    ['Српски', ['sr-RS']],
    ['한국어', ['ko-KR']],
    ['中文', ['cmn-Hans-CN', '普通话 (中国大陆)'],
        ['cmn-Hans-HK', '普通话 (香港)'],
        ['cmn-Hant-TW', '中文 (台灣)'],
        ['yue-Hant-HK', '粵語 (香港)']],
    ['日本語', ['ja-JP']],
    ['Lingua latīna', ['la']]];

$(function () {


    for (var i = 0; i < langs.length; i++) {
        // select_language.options[i] = new Option(langs[i][0], i);
        desiredlanguage.options[i] = new Option(langs[i][0], i);
    }
    // select_language.selectedIndex = 6;
    // updateCountry();
    // select_dialect.selectedIndex = 6;

    // function updateCountry() {
    //     for (var i = select_dialect.options.length - 1; i >= 0; i--) {
    //         select_dialect.remove(i);

    //     }
    //     var list = langs[select_language.selectedIndex];
    //     for (var i = 1; i < list.length; i++) {
    //         select_dialect.options.add(new Option(list[i][1], list[i][0]));

    //     }
    //     select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
    // }

    var final_span_remote = document.getElementById('final_span_remote'),
        interim_span_remote = document.getElementById('interim_span_remote'),
        final_span = document.getElementById('final_span'),
        interim_span = document.getElementById('interim_span')

    interim_span.style.opacity = '0.5';
    interim_span_remote.style.opacity = '0.5';

    function reset() {
        recognizing = false;
        interim_span.innerHTML = '';
        final_span.innerHTML = '';
        recognition.start();
    }

    var final_transcript = '';
    var recognizing = false;
    // var ignore_onend;
    // var start_timestamp;

    var recognition = new webkitSpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function () {
        recognizing = true;
    };
    recognition.onerror = function (event) {
        console.log(event.error)
        // if (event.error == 'no-speech') {
        //     ignore_onend = true;
        // }
        // if (event.error == 'audio-capture') {
        //     ignore_onend = true;
        // }
        // if (event.error == 'not-allowed') {
        //     ignore_onend = true;
        // }
    };
    recognition.onend = function () {
        reset();
        // recognizing = false;
        // if (ignore_onend) {
        //     return;
        // }
        // if (!final_transcript) {
        //     return;
        // }

        // if (window.getSelection) {
        //     window.getSelection().removeAllRanges();
        //     var range = document.createRange();
        //     range.selectNode(document.getElementById('final_span'));
        //     range.selectNode(document.getElementById('final_span_remote'));
        //     window.getSelection().addRange(range);
        // }
    };

    // socket.on('connection', function () {



    function startButton(event) {
        final_transcript = '';
        recognition.lang = select_dialect.value;
        recognition.start();
        ignore_onend = false;
        final_span.innerHTML = '';
        final_span_remote.innerHTML = '';
        interim_span.innerHTML = '';
        interim_span_remote.innerHTML = '';
        start_timestamp = event.timeStamp;
    }
    function stopButton(event) {
        if (recognizing) {
            recognition.stop();
            return;
        }
    }

    $('.results').hide();
    $('#div_language').hide();

    $('#captionOn').on('click', function (event) {
        if ($('.results').css('display') === "none" && $('#div_language').css('display') === "none") {
            $('#captionOn').css("background-color", "rgb(9,28,87)");
            $('#captionOn').css("color", "white");
            $('#captionOn').html("");
            $('#captionOn').html("Caption On");
            $('.results').show();
            // $('#div_language').show();
            startButton(event);
        } else {
            $('#captionOn').css("background-color", "rgb(122,18,22)");
            $('#captionOn').html("");
            $('#captionOn').html("Caption Off");
            $('.results').hide();
            // $('#div_language').hide();
            stopButton(event);
        }
    });
})