// index.js
require('dotenv').config();
const { connect } = require('./config/db');
const ClientRepository = require('./repositories/ClientRepository');
const PlanRepository = require('./repositories/PlanRepository');
const GenericRepository = require('./repositories/GenericRepository');
const NutritionRepository = require('./repositories/NutritionRepository');

const ClientService = require('./services/ClientService');
const PlanService = require('./services/PlanService');
const FinanceService = require('./services/FinanceService');
const NutritionService = require('./services/NutritionService');

const { mainMenu } = require('./commands/cli');

(async () => {
  const { client, db } = await connect();

  // Repositorios
  const clientRepo = new ClientRepository(db);
  const planRepo = new PlanRepository(db);
  const contractRepo = new GenericRepository(db.collection('contracts'));
  const progressRepo = new GenericRepository(db.collection('progress'));
  const nutritionRepo = new NutritionRepository(db);
  const financeRepo = new GenericRepository(db.collection('finances'))
  // Servicios
  const clientService = new ClientService(clientRepo, contractRepo, progressRepo);
  const planService = new PlanService(planRepo, contractRepo, clientRepo, progressRepo, db);
  const financeService = new FinanceService(financeRepo, contractRepo, planRepo, db);
  const nutritionService = new NutritionService(nutritionRepo);

  

  const services = { clientService, planService, financeService, nutritionService, db };
  

  // Ejecutar CLI
  mainMenu(services);
})();
