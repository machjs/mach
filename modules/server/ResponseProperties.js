var fs = require('fs');
var d = require('d');
var getMimeType = require('../utils/getMimeType');
var stringifyCookie = require('../utils/stringifyCookie');

module.exports = {

  /**
   * Sets a cookie with the given name and options.
   */
  setCookie: d(function (name, options) {
    this.addHeader('Set-Cookie', stringifyCookie(name, options));
  }),

  /**
   * Redirects the client to the given location. If status is not
   * given, it defaults to 302 Found.
   */
  redirect: d(function (status, location) {
    if (typeof status !== 'number') {
      location = status;
      status = 302;
    }

    this.status = status;
    this.headers['Location'] = location;
  }),

  /**
   * A quick way to write the status and/or content to the response.
   *
   * Examples:
   *
   *   response.send(404);
   *   response.send(404, 'Not Found');
   *   response.send('Hello world');
   *   response.send(fs.createReadStream('welcome.txt'));
   */
  send: d(function (status, content) {
    if (typeof status === 'number') {
      this.status = status;
    } else {
      content = status;
    }

    if (content != null)
      this.content = content;
  }),

  /**
   * Sends the given text in a text/plain response.
   */
  sendText: d(function (status, text) {
    this.contentType = 'text/plain';
    this.send(status, text);
  }),

  /**
   * Sends the given HTML in a text/html response.
   */
  sendHTML: d(function (status, html) {
    this.contentType = 'text/html';
    this.send(status, html);
  }),

  /**
   * Sends the given JSON in an application/json response.
   */
  sendJSON: d(function (status, json) {
    this.contentType = 'application/json';

    if (typeof status === 'number') {
      this.status = status;
    } else {
      json = status;
    }

    if (json != null)
      this.content = typeof json === 'string' ? json : JSON.stringify(json);
  }),

  /**
   * Sends a file to the client with the given options.
   *
   * Examples:
   *
   *   response.sendFile('path/to/file.txt');
   *   response.sendFile(200, 'path/to/file.txt');
   */
  sendFile: d(function (status, options) {
    if (typeof status === 'number') {
      this.status = status;
    } else {
      options = status;
    }

    if (typeof options === 'string')
      options = { path: options };

    if (options.content) {
      this.content = options.content;
    } else if (typeof options.path === 'string') {
      this.headers['Content-Length'] = fs.statSync(options.path).size;
      this.content = fs.createReadStream(options.path);
    } else {
      throw new Error('Missing file content/path');
    }

    if (options.type || options.path)
      this.headers['Content-Type'] = options.type || getMimeType(options.path);

    if (options.length || options.size)
      this.headers['Content-Length'] = options.length || options.size;
  })

};
