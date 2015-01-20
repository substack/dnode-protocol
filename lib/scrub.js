var traverse = require('traverse');
var objectKeys = require('./keys');
var forEach = require('./foreach');
var shortId = require('shortid');

// scrub callbacks out of requests in order to call them again later
module.exports = function () {
    return new Scrubber();
};

function Scrubber () {
    this.callbacks = {};
};

// Take the functions out and note them for future use
Scrubber.prototype.scrub = function (obj) {
    var self = this;
    var paths = {};
    var links = [];
    var found = {};
    
    var args = traverse(obj).map(function (node) {
        if (typeof node === 'function') {
            var id = found[node];
            if (id && !(id in paths)) {
                // Keep previous function IDs only for the first function
                // found. This is somewhat suboptimal but the alternatives
                // are worse.
                paths[id] = this.path;
            }
            else {
                id = shortId.generate();
                found[node] = id;
                self.callbacks[id] = node;
                paths[id] = this.path;
            }
            
            this.update('[Function]');
        }
        else if (this.circular) {
            links.push({ from : this.circular.path, to : this.path });
            this.update('[Circular]');
        }
    });
    
    return {
        arguments : args,
        callbacks : paths,
        links : links
    };
};
 
// Replace callbacks. The supplied function should take a callback id and
// return a callback of its own.
Scrubber.prototype.unscrub = function (msg, f) {
    var args = msg.arguments || [];
    Object.keys(msg.callbacks || {}).forEach(function (id) {
        var path = msg.callbacks[id];
        traverse.set(args, path, f(id));
    });
    
    forEach(msg.links || [], function (link) {
        var value = traverse.get(args, link.from);
        traverse.set(args, link.to, value);
    });
    
    return args;
};

Scrubber.prototype.cull = function (id) {
  delete this.callbacks[id]
};

Scrubber.prototype.find = function (id) {
  return this.callbacks[id]
};
