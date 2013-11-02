var fs = require('fs');

var expect = require('expect.js');

var Manager   = require('../lib/manager');
var AssetHost = require('../lib/asset_host');

var nullAssetHost = AssetHost.create({
  fetchAsset: function() {}
});

describe('Manager', function() {
  var manager;
  var originaBaseDir = Manager.baseDir;

  after(function() {
    Manager.baseDir = originaBaseDir;
  });

  describe('.registerHost()', function() {
    var manager;

    before(function() {
      manager = new Manager();
    });

    after(function() {
      Manager.unregisterHost('test');
    });

    it('should register asset host', function() {
      var checkAssetHost = function() {
        manager.setup('test', '0.0.0');
      };

      expect(checkAssetHost).to.throwException(/^Asset not registered: test$/);

      Manager.registerHost('test', nullAssetHost);

      expect(checkAssetHost).to.not.throwException();
    });
  });

  describe('.clearCaches()', function() {
    context('chdir to tmp', function() {
      var baseDir = __dirname + '/tmp';

      before(function() {
        Manager.baseDir = baseDir;

        fs.writeFileSync(baseDir + '/downloads/test.js', 'var TEST;');
      });

      it('should clean all caches', function() {
        expect(fs.existsSync(baseDir + '/downloads/test.js')).to.ok();

        Manager.clearCaches();

        expect(fs.existsSync(baseDir + '/downloads/test.js')).to.not.ok();
      });
    });
  });

  context('Using mock asset host', function() {
    beforeEach(function() {
      Manager.registerHost('test', nullAssetHost);
    });

    afterEach(function() {
      Manager.unregisterHost('test');
    });

    describe('.setup()', function() {
      it('return an instance of Manager', function() {
        expect(Manager.setup('test', '0.0.1')).to.be.a(Manager);
      });
    });

    describe('#setup()', function() {
      beforeEach(function() {
        manager = new Manager();
      });

      it('should return self', function() {
        expect(manager.setup('test', '0.0.0')).to.equal(manager);
      });

      it('should call `AssetHost#fetchAsset`', function(done) {
        Manager.registerHost('test', AssetHost.create({
          fetchAsset: function(version) {
            expect(version).to.equal('0.0.0');
            done();
          }
        }));

        manager.setup('test', '0.0.0');
      });

      // TODO I want to add more assertion...
      it('should allow to be given local asset', function() {
        Manager.registerHost('test', AssetHost.create({
          fetchAsset: function(version) {
            expect().fail();
          }
        }));

        manager.setup('test', __dirname + '/fixtures/custom.js');
      });
    });

    describe('#then()', function() {
      before(function() {
        manager = new Manager();
      });

      before(function() {
        Manager.baseDir = __dirname + '/tmp';
      });

      it('should give callback on setup success', function(done) {
        Manager.registerHost('test', AssetHost.create({
          fetchAsset: function(version, dir, callback) {
            callback(null, 'success.js');
          }
        }));

        manager.then(function() {
          done();
        }).setup('test', '1.0.0');
      });
    });
  });
});
