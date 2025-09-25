const { v4: uuidv4 } = require('uuid');
const withTransaction = require('../config/withTransaction');

class FinanceService {
  constructor(financeRepo, contractRepo, planRepo, db) {
    this.financeRepo = financeRepo;
    this.contractRepo = contractRepo;
    this.planRepo = planRepo;
    this.db = db;
  }


  // Registrar ingreso dentro de una transacción (seguro)
  async registerIncomeSafe({ clientId, contractId = null, planId = null, concept }) {
    return withTransaction(this.db, async (session) => {
      const amount = await this._resolveAmount({ clientId, contractId, planId, session });

      const income = {
        _id: uuidv4(),
        clientId,
        contractId,
        planId,
        type: 'income',
        concept,
        amount,
        createdAt: new Date()
      };

      await this.financeRepo.collection.insertOne(income, { session });
      return income;
    });
  }

  // Registrar ingreso simple (mensualidad / sesión)
  async registerIncome({ clientId, contractId = null, planId = null, concept }) {
    const amount = await this._resolveAmount({ clientId, contractId, planId });

    const income = {
      _id: uuidv4(),
      clientId,
      contractId,
      planId,
      type: 'income',
      concept,
      amount,
      createdAt: new Date()
    };

    return this.financeRepo.create(income);
  }

  // 🔑 Método privado para calcular el monto automáticamente
  async _resolveAmount({ clientId, contractId = null, planId = null, session = null }) {
    if (contractId) {
      const contract = await this.contractRepo.collection.findOne(
        { _id: contractId, clientId },
        { session }
      );
      if (!contract) throw new Error('Contrato no encontrado');
      return contract.price;
    }
  
    if (planId) {
      const plan = await this.planRepo.collection.findOne(
        { _id: planId },
        { session }
      );
      if (!plan) throw new Error('Plan no encontrado');
      return plan.price;
    }
  
    throw new Error('Debe asociar el ingreso a un contrato o plan');
  }
  

  // Registrar egreso (gasto)
  async registerExpenseSafe({ concept, amount }) {
    return withTransaction(this.db, async (session) => {
      if (!concept || !concept.trim()) throw new Error('Concepto obligatorio');
      if (isNaN(amount) || amount <= 0) throw new Error('Monto inválido');
  
      const expense = {
        _id: uuidv4(),
        type: 'expense',
        concept,
        amount,
        createdAt: new Date()
      };
  
      await this.financeRepo.collection.insertOne(expense, { session });
      return expense;
    });
  }
  

  // Consultar balance por rango de fechas y opcional cliente
  async getBalance({ from, to, clientId = null }) {
    const query = { createdAt: { $gte: new Date(from), $lte: new Date(to) } };
    if (clientId) query.clientId = clientId;

    const records = await this.financeRepo.find(query);
    let ingresos = 0, egresos = 0;

    for (const r of records) {
      if (r.type === 'income') ingresos += r.amount;
      if (r.type === 'expense') egresos += r.amount;
    }

    return {
      ingresos,
      egresos,
      balance: ingresos - egresos,
      detalle: records
    };
  }
}

module.exports = FinanceService;
