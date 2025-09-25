// models/FinanceRecord.js
const { v4: uuidv4 } = require('uuid');

class FinanceRecord {
  constructor(data = {}) {
    this._id = data._id || uuidv4();
    this.type = data.type || 'income'; // income | expense
    this.clientId = data.clientId || null;
    this.amount = data.amount || 0;
    this.date = data.date ? new Date(data.date) : new Date();
    this.concept = data.concept || '';
    this.metadata = data.metadata || {};
  }
}

module.exports = FinanceRecord;
