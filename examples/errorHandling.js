// To see the effect from this example, refresh the page repeatedly.
// You'll get random "hello world"s and "internal server error"s, but
// the server won't crash.

var Promise = require('bluebird').Promise;
var mach = require('../modules/server');

mach.serve(function (request) {
  if (Math.random() > 0.75)
    throw new Error('boom!');

  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (Math.random() > 0.75) {
        reject(new Error('deferred boom!'));
      } else {
        resolve('Hello world!');
      }
    }, 100);
  });
});
