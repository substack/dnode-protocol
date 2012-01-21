var Session = require('./lib/session');

var exports = module.exports = function (wrapper) {
    return new Protocol(wrapper);
};

exports.parseArgs = require('./lib/parse_args');

function Protocol (wrapper) {
    this.sessions = {};
    this.wrapper = wrapper;
}

Protocol.prototype.create = function () {
    var id = null;
    do {
        id = Math.floor(
            Math.random() * Math.pow(2,32)
        ).toString(16);
    } while (this.sessions[id]);
    
    var s = Session(id, this.wrapper);
    this.sessions[id] = s;
    return s;
};

Protocol.prototype.destroy = function (id) {
    delete self.sessions[id];
};
