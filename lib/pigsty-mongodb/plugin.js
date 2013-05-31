var debug = require('debug')('pigsty-mongodb');
var PigstyPlugin = require('pigsty-plugin');
var mongoose = require('mongoose');

MongoDB.prototype = new PigstyPlugin();
MongoDB.prototype.constructor = PigstyPlugin;

function MongoDB(options) {
  var self = this;
  PigstyPlugin.call(self, options);
  self.options = options;

  // start with default connect options
  self.connect_opts = { 
    db: {},                              // db options, not db name
    server: {                            // server options, not server name
      auto_reconnect: 'true' ,
      socketOptions: { keepAlive: 1 }
    },
    replset: {
      socketOptions: { keepAlive: 1 }
    },
    user: '',
    pass: '',
    auth: {}
  };

  // override defautl connect options with values from pigsty.config.js
  if (self.options.hasOwnProperty('db')) {
    connect_opts.server.db = self.options.db;
  };

  if (self.options.hasOwnProperty('server')) {
    connect_opts.server.server = self.options.server;
  };

  if (self.options.hasOwnProperty('replset')) {
    connect_opts.server.replset = self.options.replset;
  };

  if (self.options.hasOwnProperty('user')) {
    connect_opts.user = self.options.user;
  };

  if (self.options.hasOwnProperty('password')) {
    connect_opts.pass = self.options.password;
  };

  if (self.options.hasOwnProperty('auth')) {
    connect_opts.auth = self.options.auth;
  };
};

MongoDB.prototype.start = function(callback) {
  var self = this;
  var host = self.options.host || 'localhost';
  var port = self.options.port || '27017';
  var database = self.options.database || 'pigsty';
  var uri = 'mongodb://'.concat(host).concat(':').concat(port);
  uri = uri.concat('/').concat(database);
  debug('uri: ', uri);

  var collection = self.options.collection || 'events';

  mongoose.connect(uri, self.connect_opts);
  self.db = mongoose.connection; 
  self.db.on('error', console.error.bind(console, 'connection error:'));
  self.EventSchema = mongoose.Schema({ event: 
                                   + { type: mongoose.Schema.Types.Mixed } });
  self.Event = mongoose.model('Event', self.EventSchema, collection);

  self.emit('ready');
};

MongoDB.prototype.stop = function(callback) {
  var self = this;
  self.db.disconnect();
  self.emit('end');
};

MongoDB.prototype.send = function(event) {
  var self = this;
  debug(event);
  var Event = self.Event;
  var event = new Event({ event: event.json() });
  event.save(function (err, event) {
    if (err) {
      console.log("XXX", err);
      debug("Pigsty MongoDB Error: ", err);
      self.emit('error');
    };
  });
};

module.exports = function(options) {
  return new MongoDB(options);
};
