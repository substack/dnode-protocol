var test = require('tape');
var proto = require('../');
var traverse = require('traverse');

test('proto hashes', function (t) {
    t.plan(8);
    
    var s = proto({
        x : function (f, g) {
            setTimeout(function () { f(7, 8, 9) }, 25);
            setTimeout(function () { g([ 'q', 'r' ]) }, 50);
        },
        y : 555
    });
    
    var c = proto({});
    
    var sreqs = [];
    s.on('request', function (req) {
        sreqs.push(traverse.clone(req));
        c.handle(req);
    });
    
    var creqs = [];
    c.on('request', function (req) {
        creqs.push(traverse.clone(req));
        s.handle(req);
    });
    
    s.start();
    
    t.deepEqual(sreqs[0].callbacks[Object.keys(sreqs[0].callbacks)[0]], [ '0', 'x' ]);
    t.deepEqual(sreqs, [ {
        method : 'methods',
        arguments : [ { x : '[Function]', y : 555 } ],
        callbacks : sreqs[0].callbacks,
        links : []
    } ]);
    
    c.start();
    
    t.deepEqual(creqs, [ {
        method : 'methods',
        arguments : [ {} ],
        callbacks : {},
        links : []
    } ]);
    
    var pending = 2;
    c.request('x', [
        function (x, y , z) {
            t.deepEqual([ x, y, z ], [ 7, 8, 9 ]);
        },
        function (qr) {
            t.deepEqual(qr, [ 'q', 'r' ]);
        }
    ]);
    
    t.deepEqual(creqs.slice(1)[0].callbacks[Object.keys(creqs.slice(1)[0].callbacks)[0]], [ '0' ]);
    t.deepEqual(creqs.slice(1)[0].callbacks[Object.keys(creqs.slice(1)[0].callbacks)[1]], [ '1' ]);
    t.deepEqual(creqs.slice(1), [ {
        method : 'x',
        arguments : [ '[Function]', '[Function]' ],
        callbacks : creqs.slice(1)[0].callbacks,
        links : []
    } ]);
});
