'use strict';

const AbstractStatement = require('../abstract-statement');
const { NotImplementedError } = require('./errors');

class Statement extends AbstractStatement {
  constructor(conn) {
    this.conn = conn;
  }

  execute(sql) {
    return new Promise((resolve, reject) => {
      this.conn.query(sql, (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve({ results, fields });
        }
      });
    });
  }
};
