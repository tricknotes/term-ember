var fs     = require('fs');
var repl   = require('repl');
var util   = require('util');
var Module = require('module');

var Browser = require('zombie');
var coffee  = require('coffee-script');

module.exports = Runner;

function Runner(input, output) {
  this.input  = input;
  this.output = output;
}

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

  browser.visit(pageUrl).then(function() {
    var window = browser.window;

    window.require = function(path) {
      var fullPath = Module._resolveFilename(path);
      var script   = fs.readFileSync(fullPath).toString();

      if (/\.coffee$/.test(fullPath)) {
        script = coffee.compile(script);
      } else {
        script = '(function() {\n' + script + '\n}).call(this)';
      }

      return browser.evaluate(script);
    };

    repl.start({
      prompt: 'term ember> ',
      eval:   evalWith(browser),
      input:  input,
      output: output,
      writer: writer
    }).on('exit', function() {
      // noop
    });
  }).fail(function(e) {
    console.log(e);
  });
};

Runner.run = function(pageUrl, input, output) {
  var runner = new Runner(input, output);

  runner.run(pageUrl);
};
