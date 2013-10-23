var fs = require('fs');

var expect = require('expect.js');
var nock   = require('nock');

var AssetHost = require('../lib/asset_host');

describe('AssetHost', function() {
  describe('.create', function() {
    it('should create an instance of AssetHost', function() {
      var asset = AssetHost.create({});

      expect(asset).to.be.an(AssetHost);
    });

    it('should overwrite prototype property of AssetHost', function() {
      var asset = AssetHost.create({host: 'example.com'});

      expect(asset).to.have.property('host', 'example.com');
    });
  });

  describe('.emberHost', function() {
    var emberHost = AssetHost.emberHost;

    describe('.host', function() {
      it('should return "builds.emberjs.com"', function() {
        expect(emberHost.host).to.equal('builds.emberjs.com');
      });
    });

    context('version is "1.0.0"', function() {
      describe('.versionToFilename()', function() {
        it('should return filename with prefix "tags" and version', function() {
          expect(emberHost.versionToFilename('1.0.0')).to.equal('ember-1.0.0.js');
        });
      });

      describe('.versionToPath()', function() {
        it('should return filename with prefix "tags" and version', function() {
          expect(emberHost.versionToPath('1.0.0')).to.equal('/tags/v1.0.0/ember.js');
        });
      });
    });

    context('version is "1.0.0.rc8"', function() {
      describe('.versionToFilename()', function() {
        it('should return filename with prefix "ember-"', function() {
          expect(emberHost.versionToFilename('1.0.0rc8')).to.equal('ember-1.0.0-rc.8.js');
        });
      });

      describe('.versionToPath()', function() {
        it('should return path with prefix "tags" and version', function() {
          expect(emberHost.versionToPath('1.0.0.rc8')).to.equal('/tags/v1.0.0-rc.8/ember.js');
        });
      });
    });

    context('version is "1.0.0.rc7"', function() {
      describe('.versionToFilename()', function() {
        it('should return filename with prefix "ember-"', function() {
          expect(emberHost.versionToFilename('1.0.0rc7')).to.equal('ember-1.0.0-rc.7.js');
        });
      });

      describe('.versionToPath()', function() {
        it('should return filename with prefix "ember-"', function() {
          expect(emberHost.versionToPath('1.0.0.rc7')).to.equal('/ember-1.0.0-rc.7.js');
        });
      });
    });

    describe('.isCacheable', function() {
      it('should return true with version "1.0.0"', function() {
        expect(emberHost.isCacheable('1.0.0')).to.equal(true);
      });

      it('should return true with version "latest"', function() {
        expect(emberHost.isCacheable('latest')).to.equal(false);
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
          expect(fs.existsSync(localPath)).to.equal(false);

          emberHost.fetchAsset('1.0.0', localDir, function(error, filename) {
            expect(filename).to.equal('ember-1.0.0.js');
            expect(fs.existsSync(localPath)).to.equal(true);
            expect(fs.readFileSync(localPath).toString()).to.equal('Ember.VERSION');

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
          expect(fs.existsSync(localPath)).to.equal(false);

          emberHost.fetchAsset('1.0.0', localDir, function(error, filename) {
            expect(filename).to.equal('ember-1.0.0.js');
            expect(fs.existsSync(localPath)).to.equal(false);
            expect(error).to.be.an(Error);
            expect(error.message).to.equal('Version not found: (1.0.0)');

            done();
          });
        });
      });
    });
  });
});
