var fs   = require('fs');
var http = require('http');
var exec = require('child_process').exec;

var AssetHost = require('./asset_host');

exports.setup = setup;
exports.clearCaches = clearCaches;

function setup(type, version) {
  var manager = new Manager();

  return manager.setup(type, version);
};

function clearCaches() {
  var dir = __dirname + '/../vender/downloads/';
  fs.readdirSync(dir).forEach(function(path) {
    if (path.match(/\.js$/)) {
      fs.unlinkSync(dir + path);
    }
  });
};

var Manager = function(callback) {
  this.processing = 0;
  this.callbacks  = [];
  this.errors     = [];
};

Manager.prototype.setup = function(type, version) {
  this.processing++;

  var asset    = hosts[type];
  var host     = asset.host;
  var filename = asset.versionToFilename(version);
  var path     = asset.versionToPath(version);

  var localPath = downloadedPath(filename);

  var errors = this.errors;
  var finish = this.setuped.bind(this);

  if (asset.isCacheable(version) && fs.existsSync(localPath)) {
    switchVersion(type, filename, finish);
    return this;
  }
  // TODO Show progress
  console.log('\033[36m+\033[39m fetch: %s', filename);

  http.request({
    hostname: host,
    path:     path
  }, function(res) {
    if (res.statusCode !== 200) {
      errors.push(new Error('Version not found: ' + type + '(' + version + ')'));
      finish();
      return this;
    }

    var writer = fs.createWriteStream(localPath);
    res.pipe(writer);

    writer.on('close', function() {
      switchVersion(type, filename, finish);
    });
  }).end();

  return this;
}

Manager.prototype.setuped = function() {
  this.processing--;

  if (this.processing === 0) {
    if (this.errors.length === 0) {
      this.callbacks.forEach(function(callback) {
        callback.call(this);
      }, this);
    } else {
      var message = this.errors.map(function(error) {
        return error.message;
      }).join('\n');

      throw message;
    }
  }
};

Manager.prototype.then = function(callback) {
  this.callbacks.push(callback);

  return this;
};

var downloadedPath = function(filename) {
  return __dirname + '/../vender/downloads/' + filename;
};

var switchVersion = function(type, filename, callback) {
  exec('rm -f ' + __dirname + '/../vender/current/' + type + '.js', function(e) {
    exec('ln -s ../downloads/' + filename + ' ' + __dirname + '/../vender/current/' + type + '.js', function(e) {
      callback();
    });
  });
};

var hosts = Object.create(null);

var registerHost = exports.registerHost = function(type, options) {
  hosts[type] = options;
};

registerHost('ember',      AssetHost.emberHost);
registerHost('handlebars', AssetHost.handlebarsHost);
registerHost('jquery',     AssetHost.jqueryHost);
