'use strict';

const mysql = require('mysql');
const AbstractStatement = require('./lib/abstract-statement');
const Connection = require('./lib/impl/connection');
const { SQLConnectionError, SQLTransactionError } = require('./lib/errors');
const Transaction = require('./transaction');

module.exports = MYSQLClient;

class MYSQLClient extends AbstractStatement {
  constructor(options) {
    this.super();
    this.pool = mysql.createPool(options);
  }

  getInstance(options) {
    return new MYSQLClient(options);
  }

  getConnection() {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, connection) => {
        if (err) {
          reject(SQLConnectionError(err));
        } else {
          resolve(new Connection(connection));
        }
      });
    });
  }

  execute(sql) {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve({ results, fields });
        }
      });
    });
  }

  beginTransaction() {
    return this.getConnection().then(conn => {
      return new Promise((resolve, reject) => {
        conn.beginTransaction(err => {
          if (err) {
            conn.release();
            reject(SQLTransactionError(1004, err));
          } else {
            resolve(new Transaction(conn));
          }
        });
      });
    });
  }

  async beginTransactionScope(scope, ctx) {
    ctx = ctx || {};
    if (!ctx._transactionConnection) {
      ctx._transactionConnection = await this.beginTransaction();
      ctx._transactionScopeCount = 1;
    } else {
      ctx._transactionScopeCount++;
    }
    const tran = ctx._transactionConnection;
    try {
      const result = await scope(tran);
      ctx._transactionScopeCount--;
      if (ctx._transactionScopeCount === 0) {
        ctx._transactionConnection = null;
        await tran.commit();
      }
      return result;
    } catch (err) {
      if (ctx._transactionConnection) {
        ctx._transactionConnection = null;
        await tran.rollback();
      }
      throw err;
    }
  }

  end(callback) {
    if (typeof callback === 'function') {
      return this.pool.end(callback);
    }

    return new Promise((resolve, reject) => {
      this.pool.end((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
