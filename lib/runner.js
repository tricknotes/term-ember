var repl = require('repl');
var util = require('util');

var EventEmitter = require('events').EventEmitter;

var Browser; // Lazy load for heavy loading.

var helper = require('./helper');

module.exports = Runner;

function Runner(input, output, options) {
  if (!Browser) {
    Browser = require('zombie');
  }

  this.input  = input;
  this.output = output;

  this.prompt = (options && !isNone(options.prompt)) ? options.prompt : 'term ember> ';

  this.browser = new Browser();

  this.error = null;

  // To catch error on evaluate script.
  this.browser.removeAllListeners('error');

  this.browser.on('error', function(e) {
    this.error = e;
  }.bind(this));

  EventEmitter.call(this);
}

util.inherits(Runner, EventEmitter);

var has = {}.hasOwnProperty;

Runner.prototype.evaluate = function(script) {
  var value;

  // Skip empty script because of `browser.evaluate` throw error.
  if (!/^\([ \n]*\)$/.test(script)) {
    value = this.browser.evaluate(script);
  }

  return value;
};

Runner.prototype.evalWithBrowser = function() {
  var runner = this;

  return function (cmd, context, filename, callback) {
    runner.error = null;

    var value = runner.evaluate(cmd);

    callback(runner.error, value);
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
  var browser = this.browser;

  var input  = this.input;
  var output = this.output;

  var self = this;

  browser.visit(pageUrl).then(function() {
    var window = browser.window;

    helper.extend(browser);

    repl.start({
      prompt: self.prompt,
      eval:   self.evalWithBrowser(),
      input:  input,
      output: output,
      writer: writer
    }).on('exit', function() {
      // noop
    });

    self.emit('ready', window);
  }, function(e) {
    console.log(e);
  });

  return this;
};

Runner.run = function(pageUrl, input, output, options) {
  var runner = new Runner(input, output, options);

  return runner.run(pageUrl);
};

function isNone(object) {
  return object === null || object === undefined;
}
