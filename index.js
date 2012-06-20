var EventEmitter = require('events').EventEmitter;
var Scrubber = require('./lib/scrub');
var Store = require('./lib/store');
var objectKeys = require('./lib/keys');
var forEach = require('./lib/foreach');
var isEnumerable = require('./lib/is_enum');

module.exports = function (cons) {
    return new Proto(cons);
};

(function () { // browsers bleh
    for (var key in EventEmitter.prototype) {
        Proto.prototype[key] = EventEmitter.prototype[key];
    }
})();

function Proto (cons) {
    var self = this;
    EventEmitter.call(self);
    self.remote = {};
    
    self.localStore = new Store;
    self.remoteStore = new Store;
    
    self.scrubber = new Scrubber(self.localStore);
    
    self.localStore.on('cull', function (id) {
        self.emit('request', {
            method : 'cull',
            arguments : [id],
            callbacks : {}
        });
    });
    
    if (typeof cons === 'function') {
        self.instance = new cons(self.remote, self);
    }
    else self.instance = cons || {};
}

Proto.prototype.start = function () {
    this.request('methods', [ this.instance ]);
};

Proto.prototype.request = function (method, args) {
    var scrub = this.scrubber.scrub(args);
    
    this.emit('request', {
        method : method,
        arguments : scrub.arguments,
        callbacks : scrub.callbacks,
        links : scrub.links
    });
};

Proto.prototype.handle = function (req) {
    var self = this;
    var args = self.scrubber.unscrub(req, function (id) {
        if (!self.remoteStore.has(id)) {
            // create a new function only if one hasn't already been created
            // for a particular id
            self.remoteStore.add(function () {
                self.request(id, [].slice.apply(arguments));
            }, id);
        }
        return self.remoteStore.get(id);
    });
    
    if (req.method === 'methods') {
        self.handleMethods(args[0]);
    }
    else if (req.method === 'cull') {
        forEach(args, function (id) {
            self.remoteStore.cull(args);
        });
    }
    else if (typeof req.method === 'string') {
        if (isEnumerable(self.instance, req.method)) {
            self.apply(self.instance[req.method], self.instance, args);
        }
        else {
            self.emit('fail', new Error(
                'Request for non-enumerable method: ' + req.method
            ));
        }
    }
    else if (typeof req.method == 'number') {
        var fn = self.localStore.get(req.method);
        if (!fn) {
            self.emit('fail', new Error('no such method'));
        }
        else self.apply(fn, self.instance, args);
    }
};

Proto.prototype.handleMethods = function (methods) {
    var self = this;
    if (typeof methods != 'object') {
        methods = {};
    }
    
    // copy since assignment discards the previous refs
    forEach(objectKeys(self.remote), function (key) {
        delete self.remote[key];
    });
    
    forEach(objectKeys(methods), function (key) {
        self.remote[key] = methods[key];
    });
    
    self.emit('remote', self.remote);
    self.emit('ready');
};

Proto.prototype.apply = function (f, obj, args) {
    try { f.apply(obj, args) }
    catch (err) { this.emit('error', err) }
};
