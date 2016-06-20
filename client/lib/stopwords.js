(function() {
  var english = [
    'to',
    'sing',
    'x',
    'notebook'
  ];
  var places = [
    'usa',
    'london'
  ];
  var names = [
    'robert',
    'rob',
    'amanda',
    'susanna',
    'stewart',
    'sandra',
    'hill',
    'alexander',
    'graham',
    'bell',
    'gordon',
    'jonathan',
    'jane',
    'john',
    'boris'
  ];
  var registry = {};
  [].concat(english, places, names)
    .forEach(function(word) {
      registry[word] = true;
    });
  window.STOP_WORDS = registry;
})();