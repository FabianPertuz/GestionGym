// models/NutritionPlan.js
const { v4: uuidv4 } = require('uuid');

class NutritionPlan {
  constructor({ name, description, clientId = null, planId = null }) {
    this._id = uuidv4();
    this.name = name;
    this.description = description;
    this.clientId = clientId;
    this.planId = planId;
    this.createdAt = new Date();
    this.active = true;
  }

  validateForCreate() {
    if (!this.name || !this.name.trim()) {
      throw new Error('El nombre del plan de nutrición es obligatorio');
    }
    if (!this.description || !this.description.trim()) {
      throw new Error('La descripción es obligatoria');
    }
    // opcional: validaciones de clientId y planId
  }
}

module.exports = NutritionPlan;
