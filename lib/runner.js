var repl = require('repl');
var util = require('util');

var EventEmitter = require('events').EventEmitter;

var Browser = require('zombie');

var helper = require('./helper');

module.exports = Runner;

function Runner(input, output) {
  this.input  = input;
  this.output = output;

  EventEmitter.call(this);
}

util.inherits(Runner, EventEmitter);

var has = {}.hasOwnProperty;

var evalWith = function(browser) {

  var error;

  // To catch error on evaluate script.
  browser.removeAllListeners('error');

  browser.on('error', function(e) {
    error = e;
  });

  return function (cmd, context, filename, callback) {
    var value;

    error = null;

    // Skip empty script because of `browser.evaluate` throw error.
    if (!/^\([ \n]*\)$/.test(cmd)) {
      value = browser.evaluate(cmd);
    }

    callback(error, value);
  };
};

var writer = function(object) {
  var inspect;
  // To avoid wrong inspect by `Ember.inspect`.
  if (typeof object === 'object' &&
      object !== null &&
      has.call(object, 'inspect') &&
      has.call(object, 'toString') &&
      object.toString() === 'Ember') {

    inspect = object.inspect;
    delete object.inspect;
  }

  var value = util.inspect(object, false, 2, true);

  if (inspect) {
    object.inspect = inspect;
  }
  return value;
};

Runner.prototype.run = function run(pageUrl) {
  var browser = new Browser();

  var input  = this.input;
  var output = this.output;

  var self = this;

  browser.visit(pageUrl).then(function() {
    var window = browser.window;

    helper.extend(browser);

    repl.start({
      prompt: 'term ember> ',
      eval:   evalWith(browser),
      input:  input,
      output: output,
      writer: writer
    }).on('exit', function() {
      // noop
    });

    self.emit('ready', window);
  }).fail(function(e) {
    console.log(e);
  });

  return this;
};

Runner.run = function(pageUrl, input, output) {
  var runner = new Runner(input, output);

  return runner.run(pageUrl);
};
