var repl = require('repl');
var util = require('util');

var Browser = require('zombie');

exports.run = run;

var hasOwnProperty = {}.hasOwnProperty;

var evalWith = function(browser) {

  return function eval(cmd, context, filename, callback) {
    var value,
        error = null;

    try {
      value = browser.evaluate(cmd);
    } catch (e) {
      error = e;
    }

    callback(error, value);
  };
}

var writer = function(object) {
  var inspect;
  // To avoid wrong inspect by `Ember.inspect`.
  if (typeof object === 'object'
      && object !== null
      && hasOwnProperty.call(object, 'inspect')
      && hasOwnProperty.call(object, 'toString')
      && object.toString() === 'Ember') {

    inspect = object.inspect;
    delete object.inspect;
  }

  var value = util.inspect(object, false, 2, true);

  if (inspect) {
    object.inspect = inspect;
  }
  return value;
};

function run(pageUrl) {
  var browser = new Browser();

  browser.visit(pageUrl).then(function() {
    repl.start({
      prompt: 'term ember> ',
      eval:   evalWith(browser),
      writer: writer
    }).on('exit', function() {
      // noop
    });
  }).fail(function(e) {
    console.log(e);
  });
};
