$(function() {

  ///// Constants & Utilities /////

  var RESOURCE_DIR = 'audio/';
  var FILE_TYPE = '.ogg';
  var LINE_LIMIT = 36;

  var MOBILE_MARKERS = /Android|iPhone|iPad|iPod|Mobile|Mini|webOS/i;

  function isMobile() {
    return MOBILE_MARKERS.test(navigator.userAgent);
  }

  var MOBILE_MESSAGE = "Try this app on a computer with a keyboard.";

  function displaySpecialMessage(message) {
    renderSentence(processSentence(message));
    $('.character').attr('class', 'character shown');
  }

  if (isMobile()) {
    displaySpecialMessage(MOBILE_MESSAGE);
    return;
  }

  ///// App Variables /////

  var $Audio;

  var $Letter = '';
  var $Sentence = $('#sentence');
  var $Translation = $('#translation');

  /**
   * TO-DO: Replace with CSS loop animation
   */
  var $Blinker = {};

  function wrapText(text, limit) {
    var lines = [];
    var edge;
    while (text.length > limit) {
      edge = text.lastIndexOf(' ', limit - 1);
      edge = edge > -1 ? edge : limit - 1;
      lines.push(text.substring(0, edge));
      text = text.substring(edge + 1);
    }
    return lines.concat(text);
  }

  function processSentence(sentence) {
    var lines = wrapText(sentence, LINE_LIMIT);
    return lines.map(function(line) {
      return line.split('');
    });
  }

  var ANY_EN_LETTER = /^[a-zA-Z]$/;
  var AND_DE_LETTER = /^[\u00C4\u00E4\u00D6\u00F6\u00DC\u00FC\u00DF]$/;

  function isAlpha(char) {
    return ANY_EN_LETTER.test(char) || AND_DE_LETTER.test(char);
  }

  function makeCharElement(char) {
    var classes = 'character ' + (isAlpha(char) ? 'hidden' : 'shown');
    return $('<div></div>').text(char).addClass(classes);
  }

  function renderSentence(lines) {
    $Sentence.empty();
    lines.forEach(function(line, l) {
      $line = $('<div></div>', {class: 'line'});
      $Sentence.append($line);
      line.forEach(function(char, c) {
        $char = makeCharElement(char);
        $char.appendTo($line);
        $char.hide()
          .delay(50 * l + 5 * c).fadeIn(200); 
      });
    });
  }

  function nextAction() {
    var $tile = $('.character.hidden').first();
    if ($tile.length) {
      setFocusOn($tile);
    } else {
      onSentenceCompleted();
    }
  }

  function setFocusOn($char) {
    $char.attr('class', 'character current');
    $Letter = $char.text().toUpperCase();
    $Blinker.$el = $char;
    $Blinker.timer = setInterval(function(){
      $char.fadeOut(400).fadeIn(400);
    }, 2000);
  }

  function onCorrectKeyAnswer() {
    clearInterval($Blinker.timer);
    $Blinker.$el.attr('class', 'character shown');
    nextAction();
  }

  function onSentenceCompleted() {
    $Audio.stop();
    $Audio.play(loadAnotherEntry);
  }

  function fetchEntryData() {
    var idx = Math.floor(Math.random() * window.VT.length);
    return window.VT[idx];
  }

  function loadAnotherEntry() {
    var entry = fetchEntryData();
    $Audio.unload();
    $Audio.urls([RESOURCE_DIR + entry.f + FILE_TYPE]);
    $Translation.text(entry.en);
    var marquee = processSentence(entry.de);
    renderSentence(marquee);
    $Audio.play();
    nextAction();
  }

  // ß: 189 ½ -
  // Ä: 222 Þ '
  // Ö: 186 º ;
  // Ü: 219 Û [
  // Z <==> Y

  var KEY_MAP = {
     89: 'Z',
     90: 'Y',
    186: 'Ö',
    189: 'SS',
    219: 'Ü',
    222: 'Ä'
  };

  function isAnswerCorrect(which) {
    if (String.fromCharCode(which) === $Letter) {
      return true;
    }
    if (KEY_MAP[which] === $Letter) {
      return true;
    }
    return false;
  }

  function flashScreen () {
    $('#warning')
      .animate({ opacity: 0.5 }, 50)
      .animate({ opacity: 0 }, 50);
  }

  // Prevent page navigation by backspacing
  $(document)
    .unbind('keydown')
    .bind('keydown', function(ev) {
      if (ev.keyCode === 8) { 
        ev.preventDefault(); 
      }
  });

  // Space: 32
  $('body').keyup(function(ev) {
    var pressed = ev.which || ev.keyCode;

    ev.preventDefault(); 
    if (isAnswerCorrect(pressed)) {
      onCorrectKeyAnswer();
    } else if (pressed !== 32) {
      flashScreen(); 
      console.log(pressed, $Letter);
    }

  });

  loadAnotherEntry();

});











