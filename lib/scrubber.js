// scrub callbacks out of requests in order to call them again later

var traverse = require('traverse');
var Store = require('./store');

module.exports = function (store) {
    var self = {};
    store = store || new Store;
    self.callbacks = store.items;
    
    // Take the functions out and note them for future use
    self.scrub = function (obj) {
        var paths = {};
        var links = [];
        
        var args = traverse(obj).map(function (node) {
            if (typeof(node) == 'function') {
                var i = store.indexOf(node);
                if (i >= 0 && !(i in paths)) {
                    // Keep previous function IDs only for the first function
                    // found. This is somewhat suboptimal but the alternatives
                    // are worse.
                    paths[i] = this.path;
                }
                else {
                    var id = store.add(node);
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
    self.unscrub = function (msg, f) {
        var args = msg.arguments || [];
        Object.keys(msg.callbacks || {}).forEach(function (strId) {
            var id = parseInt(strId,10);
            var path = msg.callbacks[id];
            args = setAt(args, path, f(id));
        });
        
        (msg.links || []).forEach(function (link) {
            var value = getAt(args, link.from);
            args = setAt(args, link.to, value);
        });
        
        return args;
    };
    
    function setAt (ref, path, value) {
        var node = ref;
        for (var i = 0; i < path.length - 1; i++) {
            var key = path[i];
            if (Object.propertyIsEnumerable.call(node, key)) {
                node = node[key];
            }
            else return undefined;
        };
        var last = path.slice(-1)[0];
        if (last === undefined) {
            return value;
        }
        else {
            node[last] = value;
            return ref;
        }
    }
    
    function getAt (node, path) {
        for (var i = 0; i < path.length; i++) {
            var key = path[i];
            if (Object.propertyIsEnumerable.call(node, key)) {
                node = node[key];
            }
            else return undefined;
        }
        return node;
    }
    
    return self;
};
