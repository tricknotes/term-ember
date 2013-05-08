var util = require('util');

module.exports = AssetHost;

function AssetHost(options) {}

AssetHost.prototype = {
  constructor: AssetHost,

  host: null,

  versionToFilename: function(version) {
    return version + '.js';
  },
  versionToPath: function(version) {
    return '/' + this.versionToFilename(version);
  },
  isCacheable: function(version) {
    return true;
  }
};

AssetHost.create = function(options) {
  var F = function() {};

  F.prototype = util._extend(Object.create(AssetHost.prototype), options);
  F.prototype.constructor = F;

  return new F();
};

var emberHost = AssetHost.create({
  host: 'builds.emberjs.com',
  versionToFilename: function(version) {
    var matched = version.match(/^1\.0\.0.?rc\.?(\d)$/);
    if (matched) {
      version = '1.0.0-rc.' + matched[1];
    }
    return 'ember-' + version + '.js';
  },
  isCacheable: function(version) {
    return !/latest/.test(version);
  }
});
module.exports.emberHost = emberHost;

var handlebarsHost = AssetHost.create({
  host: 'builds.emberjs.com',
  versionToFilename: function(version) {
    var matched = version.match(/^1\.0\.0.?rc\.?(\d)$/);
    if (matched) {
      version = '1.0.0-rc.' + matched[1];
    }
    return 'handlebars-' + version + '.js';
  }
});
module.exports.handlebarsHost = handlebarsHost;

var jqueryHost = AssetHost.create({
  host: 'code.jquery.com',
  versionToFilename: function(version) {
    return 'jquery-' + version + '.js';
  }
});
module.exports.jqueryHost = jqueryHost;
