(function() {
  var english = [
    'to',
    'sing',
    'x',
    'notebook'
  ];
  var places = [
    'usa',
    'london',
    'las',
    'vegas',
    'kent',
    'kansas',
    'buckingham',
    'palace'
  ];
  var names = [
    'alexander',
    'alice',
    'amanda',
    'amy',
    'anne',
    'armstrong',
    'bell',
    'boris',
    'brandon',
    'conor',
    'eric',
    'fiona',
    'gail',
    'george',
    'gloria',
    'gordon',
    'graham',
    'harold',
    'henry',
    'hill',
    'ian',
    'jane',
    'john',
    'jonathan',
    'katrina',
    'margret',
    'maria',
    'mario',
    'neil',
    'paul',
    'picasso',
    'rob',
    'robert',
    'sam',
    'sandra',
    'stephen',
    'stewart',
    'sue',
    'susanna',
    'tess',
    'tom',
    'wilsons'
  ];
  var registry = {};
  [].concat(english, places, names)
    .forEach(function(word) {
      registry[word] = true;
    });
  window.STOP_WORDS = registry;
})();