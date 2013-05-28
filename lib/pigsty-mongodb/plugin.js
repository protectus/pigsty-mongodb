var debug = require('debug')('pigsty-mongodb');
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

  this.opts = opts;
};

MongoDB.prototype.start = function(callback) {
  mongoose.connect('mongodb://localhost/pigsty');
  this.db = mongoose.connection; // mongoose.createConnection(this.options.host, this.options.database)
  this.db.on('error', console.error.bind(console, 'connection error:'));
  this.EventSchema = mongoose.Schema({ event: { type: mongoose.Schema.Types.Mixed } });
  this.Event = mongoose.model('Event', this.EventSchema);

  this.emit('ready');
};

MongoDB.prototype.stop = function(callback) {
  this.db.disconnect();
};

MongoDB.prototype.send = function(event) {
 // console.log(event);
  var Event = this.Event;
  var event = new Event({ event: event.json() });
  event.save(function (err, event) {
    if (err) {
      console.log("XXX", err)
      debug("Pigsty MongoDB Error: ", err);
    };
  });
};

module.exports = function(options) {
  return new MongoDB(options);
};
