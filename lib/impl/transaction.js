'use strict';

const Statement = require('./statement');
const { SQLTransactionError } = require('./errors');

module.exports = Transaction;

class Transaction extends Statement {
  constructor(conn) {
    super(conn);
    this.isCommit = false;
    this.isRollback = false;
  }

  _check() {
    if (!this.conn) {
      throw new SQLTransactionError(1002);
    }
  }

  commit() {
    return new Promise((resolve, reject) => {
      this._check();
      this.conn.commit((err) => {
        this.conn.release();
        this.conn = null;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  rollback() {
    return new Promise((resolve, reject) => {
      this._check();
      this.conn.rollback(() => {
        this.conn.release();
        this.conn = null;
        resolve();
      });
    });
  }
}
