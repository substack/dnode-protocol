var weak = require('weak');
var proto = require('../');

var s = (function () {
    var cons = {
        x : function (f, g) {
            setTimeout(function () { f(5) }, 2000);
            setTimeout(function () { g(6) }, 2000);
        },
        y : 555
    };
    return proto(cons, function (fn, id) {
        weak(fn, function () { console.log('s.cull:' + id) });
        return fn;
    });
})();

var c = proto({}, function wrapc (fn, id) {
    weak(fn, function () { console.log('c.cull:' + id) });
    return fn;
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

setTimeout(function () {
    // switch on the garbage disposal to full blast:
    var xs = [];
    for (var i = 0; i < 1000 * 1000; i++) xs.push(function () {});
    xs = [];
}, 2500);
