// core/src/db/database.js

import { DatabaseError } from './base.js';

export class Database {
  constructor(db, options = {}) {
    this.db = db;
    this.options = {
      debug: options.debug || false,
      timeout: options.timeout || 5000,
      ...options
    };
  }

  async query(query, params = []) {
    try {
      if (this.options.debug) {
        console.log('DB Query:', query, params);
      }

      const stmt = this.db.prepare(query);
      const result = await stmt.bind(...params).run();

      return {
        success: result.success,
        meta: result.meta,
        results: result.results
      };
    } catch (error) {
      console.error('Database query error:', error);
      throw new DatabaseError(
        `Query failed: ${error.message}`,
        'QUERY_FAILED',
        { query, params, originalError: error }
      );
    }
  }

  async first(query, params = []) {
    const result = await this.query(query, params);
    return result.results?.[0] || null;
  }

  async all(query, params = []) {
    const result = await this.query(query, params);
    return result.results || [];
  }

  transaction() {
    return new Transaction(this.db);
  }

  async getTableInfo(tableName) {
    return await this.all(`PRAGMA table_info(${tableName})`);
  }

  async tableExists(tableName) {
    const result = await this.first(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName]
    );
    return !!result;
  }
}

class Transaction {
  constructor(db) {
    this.db = db;
    this.queries = [];
  }

  add(query, params = []) {
    this.queries.push({ query, params });
    return this;
  }

  async execute() {
    try {
      const results = [];

      for (const { query, params } of this.queries) {
        const stmt = this.db.prepare(query);
        const result = await stmt.bind(...params).run();
        results.push(result);
      }

      return results;
    } catch (error) {
      throw new DatabaseError(
        `Transaction failed: ${error.message}`,
        'TRANSACTION_FAILED',
        { originalError: error }
      );
    }
  }
}
