// models/FoodEntry.js
const { v4: uuidv4 } = require('uuid');

class FoodEntry {
  constructor(data = {}) {
    this._id = data._id || uuidv4();
    this.clientId = data.clientId;          // obligatorio
    this.planId = data.planId || null;      // opcional
    this.date = data.date ? new Date(data.date) : new Date(); // día del registro
    this.meals = data.meals || []; // [{ name: 'Desayuno', items: [{ name, calories }] }]
    this.totalCalories = data.totalCalories !== undefined ? data.totalCalories : this._calcTotal();
    this.createdAt = data.createdAt || new Date();
  }

  _calcTotal() {
    return this.meals.reduce((sum, meal) => {
      const mealSum = (meal.items || []).reduce((s,i) => s + (Number(i.calories) || 0), 0);
      return sum + mealSum;
    }, 0);
  }

  validateForCreate() {
    if (!this.clientId) throw new Error('clientId es obligatorio');
    if (!Array.isArray(this.meals) || this.meals.length === 0) throw new Error('Debe registrar al menos una comida');
    // validar cada item de meals
    for (const meal of this.meals) {
      if (!meal.name || !meal.name.trim()) throw new Error('Cada comida debe tener un nombre');
      if (!Array.isArray(meal.items) || meal.items.length === 0) throw new Error('Cada comida debe tener al menos 1 alimento');
      for (const it of meal.items) {
        if (!it.name || !it.name.trim()) throw new Error('Cada alimento debe tener nombre');
        if (isNaN(parseFloat(it.calories)) || parseFloat(it.calories) < 0) throw new Error('Calorías inválidas en un alimento');
      }
    }
  }
}

module.exports = FoodEntry;
