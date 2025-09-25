// models/Plan.js
const BaseModel = require('./BaseModel');
const { v4: uuidv4 } = require('uuid');

const VALID_LEVELS = ['principiante', 'intermedio', 'avanzado'];

class Plan extends BaseModel {
  constructor(data = {}) {
    super(data);
    this._id = data._id || uuidv4();
    this.name = data.name;
    this.durationMonths = data.durationMonths; // número de semanas
    this.goals = data.goals || '';
    this.level = data.level || 'principiante';
    this.createdAt = data.createdAt || new Date();
  }

  validateForCreate() {
    this.validateString('name', 'Nombre del plan');
    this.validateNumber('durationMonths', 'Duración (meses)', true, 1, 208);
    if (!VALID_LEVELS.includes(String(this.level).toLowerCase())) throw new Error('Nivel inválido');
  }
}

module.exports = Plan;
