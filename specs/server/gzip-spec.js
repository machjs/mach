require('./helper');

function compareBuffers(a, b) {
  expect(a).toEqual(b, 'buffers are not equal');
}

describe('mach.gzip', function () {
  var testFile = specFile('test.txt');
  var content = readFile(testFile);
  var gzipContent = readFile(testFile + '.gz');

  describe('when the client accepts gzip encoding', function () {
    var app = mach.gzip(function (request) {
      return {
        headers: { 'Content-Type': 'text/plain' },
        content: content
      };
    });

    beforeEach(function () {
      return callApp(app, {
        headers: { 'Accept-Encoding': 'gzip' },
        leaveBuffer: true
      });
    });

    it('sets the Content-Encoding header to "gzip"', function () {
      expect(lastResponse.headers['Content-Encoding']).toEqual('gzip');
    });

    it('sets the Vary header to "Accept-Encoding"', function () {
      expect(lastResponse.headers['Vary']).toEqual('Accept-Encoding');
    });

    it('gzip-encodes the response content', function () {
      compareBuffers(lastResponse.buffer, gzipContent);
    });
  });

  describe('when the client does not accept gzip encoding', function () {
    it('does not encode the content');
  });

  describe('when the response is a text/event-stream', function () {
    var app = mach.gzip(function (request) {
      return {
        headers: { 'Content-Type': 'text/event-stream' },
        content: content
      };
    });

    beforeEach(function () {
      return callApp(app, { leaveBuffer: true });
    });

    it('does not encode the content', function () {
      compareBuffers(lastResponse.buffer, content);
    });
  });
});
