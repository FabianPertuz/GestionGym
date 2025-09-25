// repositories/PlanRepository.js
const GenericRepository = require('./GenericRepository');

class PlanRepository extends GenericRepository {
  constructor(db) {
    super(db.collection('plans'));
  }

  async findByName(name) {
    return this.collection.findOne({ name });
  }
}

module.exports = PlanRepository;

