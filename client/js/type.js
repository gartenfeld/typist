soundManager.setup({
  url: 'lib/swf/',
  preferFlash: false
});

$(function() {

  ///// Constants & Utilities /////

  var RESOURCE_DIR = 'https://dbx.firebaseapp.com/audio/vt/';
  var FULL_DATA_PATH = 'lib/vt.js';
  var FILE_TYPE = '.mp3';
  var LINE_LIMIT = 33;
  var HISTORY_LIMIT = 17;

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

  ///// History Items /////

  function Word(string) {
    this.string = string;
    this.key = string.toLowerCase();
    this.$el = $('<div></div>').text(string);
    this.$el.on('click', this.toggleState.bind(this));
    this.render();
  }

  Word.prototype.render = function() {
    var classes = 'word' + (this.isActive() ? '' : ' word--muted');
    this.$el.attr('class', classes);
  };

  Word.prototype.getLocalState = function() {
    return localStorage.getItem('vt.' + this.key);
  };

  Word.prototype.setLocalState = function(state) {
    localStorage.setItem('vt.' + this.key, state);
  };

  Word.prototype.isActive = function() {
    var local = this.getLocalState();
    if (local) {
      return local === 'false' ? false : true;
    }
    return this.key in window.STOP_WORDS ? false: true;
  };

  Word.prototype.toggleState = function() {
    this.setLocalState(!this.isActive());
    this.render();
  };

  ///// Token Class /////

  function Token(string) {
    this.tiles = [];
    this.word = new Word(string);
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

  Token.prototype.reveal = function() {
    this.tiles.forEach(function(tile) {
      tile.show();
    });
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
  var $History = $('#history');

  var $Tokens = TokensService();

  var capHistoryLength = (function() {
    var $bin = [];
    var $listed = {};
    return function capHistoryLength(word) {
      $bin.forEach(function($item) { $item.remove(); });
      $bin = [];
      if (word.key in $listed) {
        $bin.push($listed[word.key].fadeOut());
      }
      $listed[word.key] = word.$el;
      var words = $History.find('.word');
      while (words.length > HISTORY_LIMIT) {
        $bin.push($(words.splice(-1, 1)).fadeOut());
      }
    };
  })();

  function addToHistory(word) {
    capHistoryLength(word);
    $History.prepend(word.$el.hide());
    word.$el.slideDown();
  }

  function onWord(token) {
    if (!token.word.isActive()) {
      token.reveal();
    }
  }

  function onWordComplete(token) {
    addToHistory(token.word);
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

  function onSentenceCompleted() {
    $Audio.stop();
    var timer = setTimeout(function() {
      clearTimeout(timer);
      $Audio.play({
        onfinish: loadAnotherEntry
      });
    }, 0);
  }

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

  var hideElement = (function() {
    var timers = {};
    return function timer(key, delay, $el) {
      if (timers[key]) {
        clearTimeout(timers[key]);
      }
      timers[key] = setTimeout(function() {
        $el.css({ opacity: 0 });
        clearTimeout(timers[key]);
      }, delay);
    };
  })();

  // ß: 189 ½ -
  // Ä: 222 Þ '
  // Ö: 186 º ;
  // Ü: 219 Û [
  // Z <==> Y

  var KEY_MAP = {
     59: 'ö',
     63: 'ß',
     89: 'z',
     90: 'y',
    173: 'ß',
    186: 'ö',
    189: 'ß',
    219: 'ü',
    222: 'ä'
  };

  function isCorrectKey(which) {
    var truth = $Focus.char.toLowerCase();
    var asserted = String.fromCharCode(which);
    if (asserted.toLowerCase() === truth) {
      return true;
    }
    if (KEY_MAP[which] === truth) {
      return true;
    }
    if (which === 0) {
      return true; // German keyboard on Firefox
    }
    return false;
  }

  var $ErrorCount = 0;

  function onCorrectKey() {
    $ErrorCount = 0;
    $Focus.show().unfocus();
    nextAction();
  }

  function flashScreen() {
    $Backdrop.css({ opacity: 0.5 });
    hideElement('backdrop', 45, $Backdrop);
  }

  var DE_KEYS = {
    'ä': '<span class="lower">"</span><span>\'</span>',
    'ö': '<span>:</span><span>;</span>',
    'ü': '<span>{</span><span>[</span>',
    'ß': '<span class="raise">_</span><span>-</span>'
  };

  var $HintLetter = $('.hint__letter');
  var $HintKey = $('.hint__key');
  var $Hint = $('.hint');

  function showHint() {
    $Hint.css({ opacity: 1 });
    hideElement('hint', 2000, $Hint);
  }

  function onIncorrectKey(which) {
    var truth = $Focus.char.toLowerCase();
    if (truth in DE_KEYS) {
      $HintLetter.text(truth);
      $HintKey.html(DE_KEYS[truth]);
      showHint();
      return;
    }
    if ($ErrorCount > 2) {
      onCorrectKey();
      return;
    }
    $ErrorCount++;
    flashScreen(); 
  }

  function toggleAudio() {
    soundManager.togglePause('voice');
    var actionText = $Audio.paused ? 'resume' : 'pause';
    $('#toggle-action').text(actionText);
  }

  var CONTROLS = {
    27: toggleAudio,
    39: loadAnotherEntry
  };

  function isIgnoredKey(which) {
    if (which === 0 || KEY_MAP[which]) {
      return false;
    }
    return which < 65 || which > 90;
  }

  $('body').keydown(function(ev) {
    ev.preventDefault();
    var pressed = ev.which || ev.keyCode;
    if (pressed in CONTROLS) {
      CONTROLS[pressed]();
      return;
    }
    if (isIgnoredKey(pressed)) {
      return;
    }
    if (isCorrectKey(pressed)) {
      onCorrectKey();
      return;
    }
    onIncorrectKey(pressed);
  });

  ///// Bootstraping Call /////
  loadAnotherEntry();
  /////////////////////////////

  // Load the full data asynchronously
  var payload = document.createElement('script');
  payload.src = FULL_DATA_PATH;
  document.head.appendChild(payload);

  /**
   * Experimental Feature
   */
  // $Audio._a.playbackRate = 1

});
