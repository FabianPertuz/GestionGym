// models/Contract.js
const { v4: uuidv4 } = require('uuid');

class Contract {
  constructor(data = {}) {
    this._id = data._id || uuidv4();
    this.clientId = data.clientId;
    this.planId = data.planId;
    this.conditions = data.conditions || '';
    this.durationMonths = data.durationMonths || 0;
    this.price = data.price || 0;
    this.startDate = data.startDate ? new Date(data.startDate) : new Date();
    this.endDate = data.endDate ? new Date(data.endDate) : new Date(this.startDate.getTime() + (this.durationMonths * 30 * 24 * 60 * 60 * 1000));
    this.status = data.status || 'active'; // active/cancelled/finished
    this.createdAt = data.createdAt || new Date();
  }
}

module.exports = Contract;
