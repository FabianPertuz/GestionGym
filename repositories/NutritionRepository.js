// repositories/NutritionRepository.js
const GenericRepository = require('./GenericRepository');

class NutritionRepository extends GenericRepository {
  constructor(db) {
    super(db.collection('nutrition_plans')); // para planes
    this.foodColl = db.collection('food_entries'); // colección separada para comidas
  }

  // plan helpers (heredan create/find/findOne del GenericRepo)
  findByName(name) {
    return this.collection.findOne({ name });
  }

  // food entries helpers
  async createFoodEntry(entry) {
    const res = await this.foodColl.insertOne(entry);
    return { _id: entry._id, ...entry };
  }

  async findFood(filter = {}) {
    return this.foodColl.find(filter).toArray();
  }

  async findFoodInRange(clientId, from, to) {
    const q = { clientId, date: { $gte: new Date(from), $lte: new Date(to) } };
    return this.foodColl.find(q).sort({ date: 1 }).toArray();
  }
}

module.exports = NutritionRepository;
