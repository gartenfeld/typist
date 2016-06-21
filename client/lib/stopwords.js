(function() {
  var english = [
    'to',
    'sing',
    'x',
    'notebook',
    'penny'
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
    'david',
    'eric',
    'fiona',
    'gail',
    'george',
    'gloria',
    'gordon',
    'graham',
    'harold',
    'harry',
    'potter',
    'henry',
    'hill',
    'ian',
    'jane',
    'john',
    'jonathan',
    'katrina',
    'lisa',
    'margret',
    'maria',
    'mario',
    'miller',
    'neil',
    'olivia',
    'paul',
    'peter',
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