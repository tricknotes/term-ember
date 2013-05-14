var fs     = require('fs');
var Module = require('module');

var coffee = require('coffee-script');

var helper = {};

module.exports = helper;

helper.helpers = Object.create(null);

helper.extend = function(browser) {
  var window = browser.window;

  for (var key in this.helpers) {
    window[key] = this.helpers[key].bind(browser);
  }
};

helper.register = function(name, fn) {
  this.helpers[name] = fn;
};

helper.register('require', function(path) {
  var fullPath = Module._resolveFilename(path);
  var script   = fs.readFileSync(fullPath).toString();

  if (/\.coffee$/.test(fullPath)) {
    script = coffee.compile(script);
  } else {
    script = '(function() {\n' + script + '\n}).call(this)';
  }

  return this.evaluate(script);
});

// XXX setTimeout/setInterval that came from Zombie are doesn't work

helper.register('setTimeout', setTimeout);

helper.register('setInterval', setInterval);
