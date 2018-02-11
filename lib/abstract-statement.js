'use strict';

const { NotImplementedError } = require('./errors');

class Statement {

  // getConnection() {
  //   throw NotImplementedError("getConnection");
  // }

  execute() {
    throw NotImplementedError("execute");
  }

  update() {
    throw NotImplementedError("update");
  }

  batchUpdate() {
    throw NotImplementedError("batchUpdate");
  }

  call() {
    throw NotImplementedError("call");
  }

  query() {
    throw NotImplementedError("query");
  }

  queryForObject() {
    throw NotImplementedError("queryForObject");
  }
};
