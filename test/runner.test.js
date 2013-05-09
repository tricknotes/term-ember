// var http   = require('http');
var util   = require('util');
var stream = require('stream');
var Stream = stream.Stream;

var expect = require('expect.js');

var Runner = require('../lib/runner');

var StubStream = function() {
  this.data = '';

  Stream.call(this);
}
util.inherits(StubStream, Stream);

StubStream.prototype.readable = true;
StubStream.prototype.writable = true;

StubStream.prototype.write  = function() {};
StubStream.prototype.resume = function() {}
StubStream.prototype.pause  = function() {}

describe('Runner', function() {
  var testFile = 'file://' + __dirname + '/fixtures/runner.html';

  var runner, input, output;

  beforeEach(function() {
    input  = new StubStream();
    output = new StubStream();

    runner = new Runner(input, output);
    runner.run(testFile, input, output);
  });

  afterEach(function() {
    input.emit('close');
  });

  it('should run with prompt', function(done) {
    output.write = function(data) {
      expect(data).to.equal('term ember> ');
      done();
    };
  });

  it('should run script with window context', function(done) {
    var first = true;

    // TODO Improve...
    output.write = function(data) {
      if ('term ember> ' === data) {
        if (first) {
          first = false;
          input.emit('data', 'message\n');
        }
      } else {
        expect(data).to.contain('It is awesome.');
        done();
      }
    };
  });
});
