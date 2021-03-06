(function() {
  var english = [
    'arsenal',
    'gate',
    'golden',
    'notebook',
    'penny',
    'queen',
    'sing',
    'to',
    'tower',
    'x'
  ];
  var places = [
    'birmingham',
    'boston',
    'brighton',
    'buckingham',
    'cambridge',
    'chicago',
    'east',
    'ely',
    'end',
    'hall',
    'kansas',
    'kent',
    'las',
    'lewes',
    'london',
    'manchester',
    'netherfield',
    'new',
    'oxford',
    'palace',
    'park',
    'sears',
    'texas',
    'usa',
    'vegas',
    'willard',
    'york'
  ];
  var names = [
    'alexander',
    'alfie',
    'ali',
    'alice',
    'amanda',
    'amy',
    'anderson',
    'andrew',
    'angela',
    'anna',
    'anne',
    'anthony',
    'armstrong',
    'barbara',
    'bell',
    'berstein',
    'bess',
    'bob',
    'boris',
    'brandon',
    'bridget',
    'carl',
    'carla',
    'carol',
    'cathy',
    'charles',
    'charlie',
    'chelsea',
    'chris',
    'christina',
    'connor',
    'conor',
    'dan',
    'danny',
    'dannys',
    'dave',
    'david',
    'dickens',
    'donald',
    'doolittle',
    'dorothy',
    'elisabeths',
    'eric',
    'fergufs',
    'fiona',
    'fisher',
    'ford',
    'fred',
    'gaby',
    'gail',
    'georg',
    'george',
    'gina',
    'gloria',
    'gordon',
    'graham',
    'harold',
    'harry',
    'hayley',
    'henela',
    'henry',
    'hill',
    'hopkins',
    'ian',
    'jack',
    'james',
    'jamie',
    'jane',
    'jeff',
    'jenny',
    'jesse',
    'jill',
    'jimmy',
    'joe',
    'john',
    'jonathan',
    'jude',
    'katie',
    'katrina',
    'kevin',
    'kim',
    'knox',
    'lady',
    'laura',
    'leonard',
    'liam',
    'lily',
    'lincoln',
    'lisa',
    'liza',
    'lucas',
    'macbeth',
    'marcus',
    'margret',
    'maria',
    'marie',
    'mario',
    'mark',
    'mary',
    'matthew',
    'merkel',
    'michael',
    'mick',
    'mikes',
    'miller',
    'molly',
    'monica',
    'mr',
    'neil',
    'nick',
    'nina',
    'oliver',
    'olivia',
    'pamela',
    'paul',
    'peggy',
    'peter',
    'picasso',
    'potter',
    'richard',
    'rob',
    'robert',
    'roger',
    'rolls',
    'rory',
    'royce',
    'sally',
    'sam',
    'sammy',
    'sandra',
    'sarah',
    'shakespeare',
    'simon',
    'smiths',
    'spencer',
    'stephen',
    'steve',
    'stewart',
    'stratford',
    'sue',
    'susanna',
    'ted',
    'tess',
    'tina',
    'tom',
    'tommy',
    'tony',
    'twain',
    'victoria',
    'wilsons',
    'wood',
    'zzz'
  ];
  var registry = {};
  [].concat(english, places, names)
    .forEach(function(word) {
      registry[word] = true;
    });
  window.STOP_WORDS = registry;
})();