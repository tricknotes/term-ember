var fs     = require('fs');
var exec   = require('child_process').exec;
var Module = require('module');

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

Manager.baseDir = __dirname + '/../vender';

Manager.prototype.setup = function(type, version) {
  this.processing++;

  var asset = hosts[type];

  if (!asset) {
    throw 'Asset not registered: ' + type;
  }

  var errors = this.errors;
  var finish = this.setuped.bind(this);

  var fullPath;
  try {
    fullPath = Module._resolveFilename(version);
  } catch (e) {
    if (!/Cannot find module/.test(e.message)) {
      throw e;
    }
  }

  if (fullPath) {
    switchVersion(type, fullPath, finish);
  } else {
    asset.fetchAsset(version, downloadDir(), function(error, filename) {
      if (error) {
        errors.push(error);
        finish();
      } else {
        switchVersion(type, '../downloads/' + filename, finish);
      }
    });
  }

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
  return Manager.baseDir + '/downloads/';
};

var downloadPath = function(filename) {
  return downloadDir() + filename;
};

var switchVersion = function(type, filepath, callback) {
  var symlinkPath = Manager.baseDir + '/current/' + type + '.js';

  exec('rm -f ' + symlinkPath, function(e) {
    exec('ln -s ' + filepath + ' ' + symlinkPath, function(e) {
      callback();
    });
  });
};

var hosts = Object.create(null);

var registerHost = Manager.registerHost = function registerHost(type, options) {
  hosts[type] = options;
};

// Use in test
Manager.unregisterHost = function(type) {
  delete hosts[type];
};

registerHost('ember',      AssetHost.emberHost);
registerHost('handlebars', AssetHost.handlebarsHost);
registerHost('jquery',     AssetHost.jqueryHost);
