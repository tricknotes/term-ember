var fs    = require('fs');
var util  = require('util');
var http  = require('http');
var https = require('https');

module.exports = AssetHost;

function AssetHost(options) {}

AssetHost.prototype = {
  constructor: AssetHost,

  protocol: http,

  host: null,

  versionToFilename: function(version) {
    return version + '.js';
  },
  versionToPath: function(version) {
    return '/' + this.versionToFilename(version);
  },
  isCacheable: function(version) {
    return true;
  },
  fetchAsset: function(version, localDir, callback) {
    var filename  = this.versionToFilename(version);
    var localPath = localDir + filename;

    if (this.isCacheable(version) && fs.existsSync(localPath)) {
      callback(null, filename);
      return;
    }
    // TODO Show progress
    console.log('\033[36m+\033[39m fetch: %s', filename);

    this.protocol.request({
      hostname: this.host,
      path:     this.versionToPath(version)
    }, function(res) {
      if (res.statusCode !== 200) {
        var error = new Error('Version not found: (' + filename + ')');
        callback(error, filename);
        return;
      }

      var writer = fs.createWriteStream(localPath);
      res.pipe(writer);

      writer.on('close', function() {
        callback(null, filename);
      });
    }).end();
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
  protocol: https,
  host: 'raw.github.com',
  _normalizeVersion: function(version) {
    var matched = version.match(/^1\.0\.0.?rc\.?(\d)$/);
    if (matched) {
      version = '1.0.0-rc.' + matched[1];
    }
    return version;
  },
  versionToPath: function(version) {
    return '/wycats/handlebars.js/' + this._normalizeVersion(version) + '/dist/handlebars.js';
  },
  versionToFilename: function(version) {
    return 'handlebars-' + this._normalizeVersion(version) + '.js';
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
