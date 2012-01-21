var EventEmitter = require('events').EventEmitter;

module.exports = Store

function Store () {
    this.items = [];
}

Store.prototype = new EventEmitter;

Store.prototype.has = function (id) {
    return this.items[id] !== undefined;
};

Store.prototype.get = function (id) {
    if (!this.has(id)) return null;
    return this.wrap(this.items[id]);
};

Store.prototype.add = function (fn, id) {
    if (id == undefined) id = this.items.length;
    this.items[id] = fn;
    return id;
};

Store.prototype.cull = function (arg) {
    if (typeof arg == 'function') {
        arg = this.items.indexOf(arg);
    }
    delete this.items[arg];
    return arg;
};

Store.prototype.indexOf = function (fn) {
    return this.items.indexOf(fn);
};

Store.prototype.wrap = function (fn) {
    var self = this;
    return function () {
        fn.apply(this, arguments);
        self.autoCull(fn);
    };
};

Store.prototype.autoCull = function (fn) {
    if (typeof fn.times == 'number') {
        fn.times--;
        if (fn.times == 0) {
            var id = this.cull(fn);
            this.emit('cull', id);
        }
    }
};
