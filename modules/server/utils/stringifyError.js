var inspect = require('util').inspect;

function stringifyError(error) {
  if (error) {
    if (typeof error.stack === 'string')
      return error.stack;

    if (typeof error === 'string')
      return error;
  }

  // This is some other object posing as an Error.
  return 'Error: ' + inspect(error);
}

module.exports = stringifyError;
