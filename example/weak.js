var weak = require('weak');
var proto = require('../');

var s = (function () {
    var cons = {
        x : function (f, g) {
            setTimeout(function () { f(5) }, 2000);
            setTimeout(function () { g(6) }, 4000);
        },
        y : 555
    };
    return proto(cons, function (cb, id) {
        var ref = weak(cb, function () {
            console.log('s.cull(' + id + ')')
            s.cull(id);
        });
        return function () {
            var f = weak.get(ref);
            if (f) f.apply(this, arguments);
        };
    });
})();

var c = proto({}, function (cb, id) {
    var ref = weak(cb, function () {
        console.log('c.cull(' + id + ')')
        c.cull(id);
    });
    return function () {
        var f = weak.get(ref);
        if (f) f.apply(this, arguments);
    };
});

s.on('request', c.handle.bind(c));
c.on('request', s.handle.bind(s));

c.on('remote', function (remote) {
    function f (x) { console.log('f(' + x + ')') }
    function g (x) { console.log('g(' + x + ')') }
    remote.x(f, g);
});

s.start();
c.start();

/*
setTimeout(function () {
    // switch on the garbage disposal to full blast:
    var xs = [];
    for (var i = 0; i < 1000 * 1000; i++) xs.push(function () {});
    xs = [];
}, 2500);
*/
