var Promise = require('./utils/Promise');
var decodeBase64 = require('./utils/decodeBase64');

function unauthorized(response, realm) {
  realm = realm || 'Authorization Required';
  response.headers['WWW-Authenticate'] = 'Basic realm="' + realm + '"';
  response.sendText(401, 'Not Authorized');
}

/**
 * A middleware that performs basic auth on the incoming request before passing
 * it downstream.
 *
 * The `validate` argument must be a function that accepts two arguments: the
 * username and password given in the request. It must return the username to
 * use for the request (or simply `true` to indicate the given username is
 * valid) or a promise for such a value. The validated username is stored in the
 * `remoteUser` request variable.
 *
 * When authorization fails, the client automatically receives a 401 Unauthorized
 * response with the appropriate challenge in the WWW-Authenticate header.
 *
 * Example:
 *
 *   mach.basicAuth(app, function (user, pass) {
 *     // Return a boolean value to indicate the given credentials are valid.
 *     return (user === 'admin' && pass === 'secret');
 *   });
 *
 *   mach.basicAuth(app, function (user, pass) {
 *     // Return a promise for the actual username to use.
 *     return query('SELECT username FROM users WHERE handle=? AND password=?', user, pass);
 *   });
 */
function basicAuth(app, options) {
  options = options || {};

  if (typeof options === 'function')
    options = { validate: options };

  if (typeof options.validate !== 'function')
    throw new Error('mach.basicAuth needs a validation function');

  return function (request, response) {
    if (request.remoteUser)
      return request.call(app); // Don't overwrite existing remoteUser.

    var auth = request.auth;
    if (!auth)
      return unauthorized(response, options.realm);

    var parts = auth.split(' ', 2);
    var scheme = parts[0];
    if (scheme.toLowerCase() !== 'basic')
      return response.sendText(400, 'Bad Request');

    var params = decodeBase64(parts[1]).split(':');
    var username = params[0], password = params[1];

    return Promise.resolve(options.validate(username, password)).then(function (user) {
      if (!user)
        return unauthorized(response, options.realm);

      request.remoteUser = (user === true) ? username : user;

      return request.call(app);
    });
  };
}

module.exports = basicAuth;
