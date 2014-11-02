var fs = require('fs');

var assert = require('power-assert');
var nock   = require('nock');

var AssetHost = require('../lib/asset_host');

describe('AssetHost', function() {
  describe('.create', function() {
    it('should create an instance of AssetHost', function() {
      var asset = AssetHost.create({});

      assert(asset instanceof AssetHost);
    });

    it('should overwrite prototype property of AssetHost', function() {
      var asset = AssetHost.create({host: 'example.com'});

      assert(asset.host === 'example.com');
    });
  });

  describe('.emberHost', function() {
    var emberHost = AssetHost.emberHost;

    describe('.host', function() {
      it('should return "builds.emberjs.com"', function() {
        assert(emberHost.host() === 'builds.emberjs.com');
      });
    });

    context('version is "1.0.0"', function() {
      describe('.versionToFilename()', function() {
        it('should return filename with prefix "tags" and version', function() {
          assert(emberHost.versionToFilename('1.0.0') === 'ember-1.0.0.js');
        });
      });

      describe('.versionToPath()', function() {
        it('should return filename with prefix "tags" and version', function() {
          assert(emberHost.versionToPath('1.0.0') === '/tags/v1.0.0/ember.js');
        });
      });
    });

    context('version is "1.0.0.rc8"', function() {
      describe('.versionToFilename()', function() {
        it('should return filename with prefix "ember-"', function() {
          assert(emberHost.versionToFilename('1.0.0rc8') === 'ember-1.0.0-rc.8.js');
        });
      });

      describe('.versionToPath()', function() {
        it('should return path with prefix "tags" and version', function() {
          assert(emberHost.versionToPath('1.0.0.rc8') === '/tags/v1.0.0-rc.8/ember.js');
        });
      });
    });

    context('version is "1.0.0.rc7"', function() {
      describe('.versionToFilename()', function() {
        it('should return filename with prefix "ember-"', function() {
          assert(emberHost.versionToFilename('1.0.0rc7') === 'ember-1.0.0-rc.7.js');
        });
      });

      describe('.versionToPath()', function() {
        it('should return filename with prefix "ember-"', function() {
          assert(emberHost.versionToPath('1.0.0.rc7') === '/ember-1.0.0-rc.7.js');
        });
      });
    });

    context('version is "latest"', function() {
      describe('.versionToFilename()', function() {
        it('should return filename "ember-latest.js"', function() {
          assert(emberHost.versionToFilename('latest') === 'ember-latest.js');
        });
      });

      describe('.versionToPath()', function() {
        it('should return path "/canary/ember.js"', function() {
          assert(emberHost.versionToPath('latest') === '/canary/ember.js');
        });
      });
    });

    describe('.isCacheable', function() {
      it('should return true with version "1.0.0"', function() {
        assert(emberHost.isCacheable('1.0.0'));
      });

      it('should return true with version "latest"', function() {
        assert(!emberHost.isCacheable('latest'));
      });
    });

    // TODO stdout should be tested.
    describe('.fetchAsset', function() {
      var emberHost = AssetHost.emberHost;
      var localDir  = __dirname + '/tmp/downloads/';
      var localPath = localDir + 'ember-1.0.0.js';

      beforeEach(function() {
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      });

      afterEach(function() {
        nock.cleanAll();
      });

      context('When host returns 200', function() {
        before(function() {
          nock('http://builds.emberjs.com')
            .get('/tags/v1.0.0/ember.js')
            .reply(200, "Ember.VERSION");
        });

        it('should fetch asset', function(done) {
          // XXX This test fails in Node.js 0.8
          assert(!fs.existsSync(localPath));

          emberHost.fetchAsset('1.0.0', localDir, function(error, filename) {
            assert(filename === 'ember-1.0.0.js');
            assert(fs.existsSync(localPath));
            assert(fs.readFileSync(localPath).toString() === 'Ember.VERSION');

            done(error);
          });
        });
      });

      context('When host returns 404', function() {
        before(function() {
          nock('http://builds.emberjs.com')
            .get('/tags/v1.0.0/ember.js')
            .reply(404, "Not cound");
        });

        it('should fetch asset', function(done) {
          assert(!fs.existsSync(localPath));

          emberHost.fetchAsset('1.0.0', localDir, function(error, filename) {
            assert(filename === 'ember-1.0.0.js');
            assert(!fs.existsSync(localPath));
            assert(error instanceof Error);
            assert(error.message === 'Version not found: (1.0.0)');

            done();
          });
        });
      });
    });
  });
});
