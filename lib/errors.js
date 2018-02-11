'use strict';

const statuses = {
  500: 'unknown error',
  1001: 'not implemented yet',
  1002: 'The connection has been released',
  1003: 'Could not get a connection',
  1004: 'Could not begin a transaction'
};

function createError() {
  let err;
  let msg;
  let code = 500;
  let props = {};
  for (let i = 0, j = arguments.length; i < j; i++) {
    let arg = arguments[i];
    if (arg instanceof Error) {
      err = arg;
      code = err.code || code;
      continue;
    }
    switch (typeof arg) {
      case 'string':
        msg = arg;
        break
      case 'number':
        code = arg;
        break;
      case 'object':
        props = arg;
        break;
    }
  }

  if (!err) {
    err = new Error(msg || statuses[code]);
    Error.captureStackTrace(err, createError);
  }

  if (err.code !== code) {
    err.expose = true;
    err.code = code;
  }

  for (var key in props) {
    if (key !== code) {
      err[key] = props[key];
    }
  }

  return err;
}

module.exports = {
  NotImplementedError(methodName) {
    const code = 1001;
    return createError(code, `The "${methodName}()" was ${statuses[code]}.`, {
      name: 'NotImplementedError'
    });
  },
  SQLTransactionError(code, msg) {
    return createError(code, msg || statuses[code], {
      name: 'SQLTransactionError'
    });
  },
  SQLConnectionError(err) {
    const code = 1003;
    return createError(code, err, {
      name: 'SQLConnectionError',
      message: `${statuses[code]};nested error is ${err.message}`
    });
  }
};
