// models/Progress.js
const { v4: uuidv4 } = require('uuid');

class Progress {
  constructor(data = {}) {
    this._id = data._id || uuidv4();
    this.clientId = data.clientId;
    this.planId = data.planId;
    this.date = data.date ? new Date(data.date) : new Date();
    this.weight = data.weight; // kg
    this.bodyFat = data.bodyFat; // %
    this.bmi = data.bmi;
    this.measurements = data.measurements || {}; // { chest, waist, hip, ... }
    this.photos = data.photos || []; // store paths or URLs
    this.comments = data.comments || '';
    this.date = data.date ? new Date(data.date) : new Date();
  }
}

module.exports = Progress;
