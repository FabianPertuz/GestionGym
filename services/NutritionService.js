// services/NutritionService.js
const NutritionPlan = require('../models/NutritionPlan');
const FoodEntry = require('../models/FoodEntry');
const { withTransaction } = require('../config/db'); // si querés usar transacciones para asignaciones

class NutritionService {
  constructor(nutritionRepo, clientRepo, planRepo, db) {
    this.nutritionRepo = nutritionRepo;
    this.clientRepo = clientRepo;
    this.planRepo = planRepo;
    this.db = db;
  }

  // Crear plan de nutrición (global o asociado)
  async createPlan(data) {
    const p = new NutritionPlan(data);
    p.validateForCreate();
    const exists = await this.nutritionRepo.findOne({ name: p.name });
    if (exists) throw new Error('Ya existe un plan de nutrición con ese nombre');
    return this.nutritionRepo.create(p);
  }

  // Asignar un plan de nutrición a cliente (opcional: en transacción si necesitás referencias)
  async assignNutritionPlanToClient({ email, planName }) {
    // validar cliente y plan
    const client = await this.clientRepo.findByEmail(email);
    if (!client) throw new Error('Cliente no encontrado');

    const plan = await this.nutritionRepo.findOne({ name: planName });
    if (!plan) throw new Error('Plan de nutrición no encontrado');

    // asociar (ejemplo: actualizar plan con clientId o crear documento de asignación)
    return this.nutritionRepo.update({ _id: plan._id }, { $set: { clientId: client._id }});
  }

  // Registrar una entrada de alimentos para un cliente
  async addFoodEntry({ clientId, planId = null, date, meals }) {
    const entry = new FoodEntry({ clientId, planId, date, meals });
    entry.validateForCreate();
    // calcular totalCalories por si no vino
    entry.totalCalories = entry._calcTotal ? entry._calcTotal() : entry.totalCalories;
    return this.nutritionRepo.createFoodEntry(entry);
  }

  // Reporte nutricional semanal: devuelve por día total y listados
  async getWeeklyReport({ clientId, weekStartDate /* ISO string or Date */ }) {
    const start = new Date(weekStartDate);
    start.setHours(0,0,0,0);
    const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    end.setHours(23,59,59,999);

    const entries = await this.nutritionRepo.findFoodInRange(clientId, start, end);

    // agrupar por dia
    const byDay = {};
    for (let i=0;i<7;i++) {
      const d = new Date(start.getTime() + i*24*60*60*1000);
      const key = d.toISOString().split('T')[0];
      byDay[key] = { totalCalories: 0, entries: [] };
    }

    entries.forEach(e => {
      const key = e.date.toISOString().split('T')[0];
      if (!byDay[key]) byDay[key] = { totalCalories: 0, entries: [] };
      byDay[key].totalCalories += (e.totalCalories || 0);
      byDay[key].entries.push(e);
    });

    const totalWeek = Object.values(byDay).reduce((s, d) => s + (d.totalCalories||0), 0);

    return { byDay, totalWeek };
  }
}

module.exports = NutritionService;
