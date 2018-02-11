'use strict';

const Transaction = require('./transaction');

module.exports = Connection;

class Connection extends Transaction {
  constructor(conn) {
    super(conn);
  }

  release() {
    this.conn.release();
  }

  beginTransaction() {
    return new Promise((resolve, reject) => {
      this.conn.beginTransaction((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
