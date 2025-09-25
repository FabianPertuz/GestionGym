// models/BaseModel.js
class BaseModel {
    constructor(fields = {}) {
      Object.assign(this, fields);
    }
  
    validateString(field, name, required = true, maxLen = 256) {
      const v = this[field];
      if (required && (v === undefined || v === null || v === '')) {
        throw new Error(`${name} es requerido`);
      }
      if (v !== undefined && typeof v !== 'string') throw new Error(`${name} debe ser texto`);
      if (typeof v === 'string' && v.length > maxLen) throw new Error(`${name} excede longitud máxima`);
    }
  
    validateNumber(field, name, required = true, min = null, max = null) {
      const v = this[field];
      if (required && (v === undefined || v === null)) throw new Error(`${name} es requerido`);
      if (v !== undefined && typeof v !== 'number') throw new Error(`${name} debe ser numérico`);
      if (min !== null && v < min) throw new Error(`${name} menor que mínimo`);
      if (max !== null && v > max) throw new Error(`${name} mayor que máximo`);
    }
  }
  
  module.exports = BaseModel;
  