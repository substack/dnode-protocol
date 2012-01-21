var test = require('tap').test;
var Scrubber = require('../lib/scrubber');

test('circular', function (t) {
    var s = new Scrubber;
    
    var obj = { a : 1, b : 2 };
    obj.c = obj;
    
    t.deepEqual(
        s.scrub([ obj ]),
        {
            arguments : [ { a : 1, b : 2, c : '[Circular]' } ],
            callbacks : {},
            links : [ { 'from' : [ '0' ], 'to' : [ '0', 'c' ] } ],
        }
    );
    
    t.end();
});
