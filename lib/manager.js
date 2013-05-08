var fs   = require('fs');
var http = require('http');
var exec = require('child_process').exec;

var AssetHost = require('./asset_host');

module.exports = Manager;

function Manager(callback) {
  this.processing = 0;
  this.callbacks  = [];
  this.errors     = [];
}

Manager.setup = function setup(type, version) {
  var manager = new Manager();

  return manager.setup(type, version);
};

Manager.clearCaches = function clearCaches() {
  fs.readdirSync(downloadDir()).forEach(function(path) {
    if (path.match(/\.js$/)) {
      fs.unlinkSync(downloadPath(path));
    }
  });
};

Manager.prototype.setup = function(type, version) {
  this.processing++;

  var asset    = hosts[type];
  var host     = asset.host;
  var filename = asset.versionToFilename(version);
  var path     = asset.versionToPath(version);

  var localPath = downloadPath(filename);

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
};

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

var downloadDir = function() {
  return __dirname + '/../vender/downloads/';
};

var downloadPath = function(filename) {
  return downloadDir() + filename;
};

var switchVersion = function(type, filename, callback) {
  var symlinkPath = __dirname + '/../vender/current/' + type + '.js';

  exec('rm -f ' + symlinkPath, function(e) {
    exec('ln -s ../downloads/' + filename + ' ' + symlinkPath, function(e) {
      callback();
    });
  });
};

var hosts = Object.create(null);

var registerHost = Manager.registerHost = function registerHost(type, options) {
  hosts[type] = options;
};

registerHost('ember',      AssetHost.emberHost);
registerHost('handlebars', AssetHost.handlebarsHost);
registerHost('jquery',     AssetHost.jqueryHost);
