soundManager.setup({
  url: 'lib/swf/',
  flashVersion: 9,
  preferFlash: false,
});

$(function() {

  ///// Constants & Utilities /////

  // var RESOURCE_DIR = 'audio/';
  var RESOURCE_DIR = 'https://dbx.firebaseapp.com/audio/vt/';
  var FILE_TYPE = '.ogg';
  var LINE_LIMIT = 36;

  ///// Modules /////

  var ANY_EN_LETTER = /^[a-zA-Z]$/;
  var AND_DE_LETTER = /^[\u00C4\u00E4\u00D6\u00F6\u00DC\u00FC\u00DF]$/;

  function isAlpha(char) {
    return ANY_EN_LETTER.test(char) || AND_DE_LETTER.test(char);
  }

  ///// Tile Class /////

  function Tile(params) {
    this.id = params.id;
    this.char = params.char;
    this.parent = params.parent;
    this.isLast = params.isLast;
    this.$el = $('<div></div>').text(params.char);
    this.$el.attr('data-id', this.id);
    this.$el.addClass(this.classes.base);
    this.hide();
  }

  Tile.prototype.classes = {
    base: 'character',
    current: 'caret',
    hidden: 'opaque',
    shown: 'apparent'
  };

  Tile.prototype.hide = function() {
    this.$el.removeClass(this.classes.shown);
    this.$el.addClass(this.classes.hidden);
    return this;
  };

  Tile.prototype.show = function() {
    this.$el.removeClass(this.classes.hidden);
    this.$el.addClass(this.classes.shown);
    if (this.isLast && this.parent) {
      this.parent.triggerComplete();
    }
    return this;
  };

  Tile.prototype.focus = function() {
    this.$el.addClass(this.classes.current);
    return this;
  };

  Tile.prototype.unfocus = function() {
    this.$el.removeClass(this.classes.current);
    return this;
  };

  ///// Token Class /////

  function Token(string) {
    this.string = string;
    this.tiles = [];
    this._onComplete = function() {};
  }

  Token.prototype.onComplete = function(callback) {
    if (typeof callback === 'function') {
      this._onComplete = callback;
    }
  };

  Token.prototype.triggerComplete = function() {
    this._onComplete(this);
  };

  ///// TokensService /////

  function TokensService() {

    var _tileMapping = {};
    var _idOffset = 0;
    var _onToken = function() {};
    var _onTokenComplete = function() {};

    var makeTile = function(char, parent, isLast) {
      var params = {
        id: _idOffset,
        char: char,
        parent: parent || null,
        isLast: isLast || false
      };
      var tile = new Tile(params);
      _tileMapping[tile.id] = tile;
      _idOffset++;
      return tile;
    };

    var makeToken = function(string) {
      if (!string) { return []; }
      var token = new Token(string);
      token.tiles = string.split('')
        .map(function(char, i) {
          var isLast = i === string.length - 1;
          var tile = makeTile(char, token, isLast);
          return tile;
        });
      token.onComplete(_onTokenComplete);
      _onToken(token);
      return token.tiles;
    };

    var makeLine = function(text) {
      var tiles = [];
      var token = '';
      var chars = text.split('');
      chars.forEach(function(char) {
        if (isAlpha(char)) {
          token += char;
        } else {
          tiles = tiles.concat(makeToken(token));
          tiles.push(makeTile(char).show());
          token = '';
        }
      });
      return tiles.concat(makeToken(token));
    };

    return {
      reset: function() {
        _tileMapping = {};
        _idOffset = 0;
      },
      onTokenComplete: function(callback) {
        if (typeof callback === 'function') {
          _onTokenComplete = callback;
        }
      },
      onToken: function(callback) {
        if (typeof callback === 'function') {
          _onToken = callback;
        }
      },
      getTileById: function(id) {
        return _tileMapping[id];
      },
      makeTilesForLine: makeLine
    };
  }

  ///// App Globals /////

  var $Audio = soundManager.createSound({
    id: 'voice',
    volume: 60,
    stream: true
  });

  var $Focus;
  var $Sentence = $('#sentence');
  var $Translation = $('#translation');
  var $Backdrop = $('#backdrop');

  var $Tokens = TokensService();

  function onWord(token) {
    // /* */ console.log('Parsed: ' + token.string);
  }

  function onWordComplete(token) {
    // /* */ console.log('Completed: ' + token.string);
  }

  $Tokens.onToken(onWord);
  $Tokens.onTokenComplete(onWordComplete);

  ///// /////

  var MOBILE_MARKERS = /Android|iPhone|iPad|iPod|Mobile|Mini|webOS/i;
  function isMobile() {
    return MOBILE_MARKERS.test(navigator.userAgent);
  }
  var MOBILE_MESSAGE = "Try this app on a computer with a keyboard.";
  function displaySpecialMessage(message) {
    renderSentence(tilesFromText(message));
    $('.character').attr('class', 'character apparent blink');
    $('.banner').hide();
    $('.panel').hide();
    $('#stage').css({marginLeft: '7%'});
  }
  if (isMobile()) {
    displaySpecialMessage(MOBILE_MESSAGE);
    return;
  }

  ///// /////

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


  function tilesFromText(sentence) {
    var lines = wrapText(sentence, LINE_LIMIT);
    return lines.map(function(line) {
      return $Tokens.makeTilesForLine(line);
    });
  }

  function renderSentence(lines) {
    $Sentence.empty();
    lines.forEach(function(line, l) {
      $line = $('<div></div>', {class: 'line'});
      $Sentence.append($line);
      line.forEach(function(tile, c) {
        tile.$el.appendTo($line);
        tile.$el.hide()
          .delay(100 * l + 10 * c).fadeIn(200); 
      });
    });
  }

  function nextAction() {
    var $tile = $('.character.opaque').first();
    if ($tile.length) {
      setFocusOn($tile);
    } else {
      onSentenceCompleted();
    }
  }

  function setFocusOn($tile) {
    var id = $tile.attr('data-id');
    var tile = $Tokens.getTileById(id);
    $Focus = tile.focus();
  }

  function onCorrectKeyAnswer() {
    $Focus.show().unfocus();
    nextAction();
  }

  function onSentenceCompleted() {
    $Audio.stop();
    var timer = setTimeout(function() {
      clearTimeout(timer);
      $Audio.play({
        onfinish: loadAnotherEntry
      });
    }, 0);
  }

window.next = onSentenceCompleted;

  function fetchEntryData() {
    var idx = Math.floor(Math.random() * window.VT.length);
    return window.VT[idx];
  }

  function loadAnotherEntry() {
    var entry = fetchEntryData();
    $Tokens.reset();
    $Audio.play({ 
      url: RESOURCE_DIR + entry.f + FILE_TYPE,
      loops: 200
    });
    $Translation.text(entry.en);
    var marquee = tilesFromText(entry.de);
    renderSentence(marquee);
    nextAction();
  }

  // ß: 189 ½ -
  // Ä: 222 Þ '
  // Ö: 186 º ;
  // Ü: 219 Û [
  // Z <==> Y

  var KEY_MAP = {
     89: 'z',
     90: 'y',
    186: 'ö',
    189: 'ß',
    219: 'ü',
    222: 'ä'
  };

  function isAnswerCorrect(which) {
    var truth = $Focus.char.toLowerCase();
    var asserted = String.fromCharCode(which);
    if (asserted.toLowerCase() === truth) {
      return true;
    }
    if (KEY_MAP[which] === truth) {
      return true;
    }
    return false;
  }

  function flashScreen () {
    $Backdrop
      .animate({ opacity: 0.5 }, 50)
      .animate({ opacity: 0 }, 25);
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
      /* */ console.log(pressed + '≠' + $Focus.char);
    }
  });

  loadAnotherEntry();

});
