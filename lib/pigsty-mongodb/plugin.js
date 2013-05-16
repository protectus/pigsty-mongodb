var debug = require('debug')('pigsty-example-plugin');
var PigstyPlugin = require('pigsty-plugin');
var mongoose = require('mongoose');

MongoDB.prototype = new PigstyPlugin();
MongoDB.prototype.constructor = PigstyPlugin;

function MongoDB(options) {
  PigstyPlugin.call(this, options);
  this.options = options;

  var opts = { 
    server: { 
      auto_reconnect: false 
    }
  };

  if (this.options.hasOwnProperty('auto_reconnect')) {
    if (this.options.auto_reconnect) {
      opts.server.auto_reconnect = true;
    };
  };

  if (this.options.hasOwnProperty('user')) {
    opts.user = this.options.user;
  };

  if (this.options.hasOwnProperty('password')) {
    opts.password = this.options.password;
  };

  this.db = mongoose.createConnection();
  this.db.open(this.options.host, this.options.database, this.options.port, [opts]);
  this.EventSchema = mongoose.Schema({});
  this.Event = mongoose.model('Event', this.EventSchema);
};

MongoDB.prototype.start = function(callback) {
  this.db.connect();
};

MongoDB.prototype.stop = function(callback) {
  this.db.disaconnect();
};

MongoDB.prototype.send = function(event) {
  console.log(event);
  var event = new Event(event);
  event.save(function (err, event) {
    if (err) {
      debug("Pigsty MongoDB Error: ", err);
    };
  });
};

module.exports = function(options) {
  return new MongoDB(options);
};
