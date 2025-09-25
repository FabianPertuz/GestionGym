// services/PlanService.js
const Plan = require('../models/Plan');
const Contract = require('../models/Contract');
const Progress = require('../models/Progress');
const { withTransaction } = require('../config/db');

/**
 * PlanService: responsable único de la lógica de planes y contratos
 * - Aplica SRP (Single Responsibility)
 * - Usa repositories inyectados (Dependency Inversion)
 */
class PlanService {
  constructor(planRepo, contractRepo, clientRepo, progressRepo, db) {
    this.planRepo = planRepo;
    this.contractRepo = contractRepo;
    this.clientRepo = clientRepo;
    this.progressRepo = progressRepo;
    this.db = db;
    this.contractsColl = this.db.collection('contracts'); // colección de contratos
    this.clientsColl = this.db.collection('clients');     // colección de clientes
  }
  async cancelContractByClient(clientId, reason) {
    const contract = await this.contractsColl.findOne({ clientId, status: 'active' });

    if (!contract) {
      throw new Error('⚠️ No se encontró un contrato activo para este cliente.');
    }

    // Cancelar el contrato
    await this.contractsColl.updateOne(
      { _id: contract._id },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelReason: reason
        }
      }
    );

    await this.clientsColl.updateOne(
      { _id: clientId },
      { $set: { status: 'inactive' } }
    );

    return {
      contractId: contract._id,
      clientId,
      reason,
      cancelledAt: new Date()
    };
  }

  async cancelContract({ contractId, reason = '' }) {
    // contractId viene del objeto que recibes como argumento
    const contract = await this.contractRepo.findOne({ _id: contractId });
    if (!contract) throw new Error('Contrato no existe');
  
    // Marcar contrato cancelado
    await this.contractRepo.update(
      { _id: contractId },
      { $set: { status: 'cancelled', cancelledAt: new Date(), cancelReason: reason } }
    );
  
    // Borrar progresos asociados
    await this.progressRepo.delete({ clientId: contract.clientId, planId: contract.planId });
  
    // Verificar si el cliente tiene otro contrato activo
    const activeOther = await this.contractRepo.findOne({ clientId: contract.clientId, status: 'active' });
    if (!activeOther) {
      await this.clientRepo.update(
        { _id: contract.clientId },
        { $set: { status: 'inactive' } }
      );
    }
  
    return { cancelled: true, contractId };
  }
  


  async createPlan(data) {
    const plan = new Plan(data);
    plan.validateForCreate();
    const exists = await this.planRepo.findByName(plan.name);
    if (exists) throw new Error('Nombre de plan ya existe');
    return this.planRepo.create(plan);
  }

  /**
   * Buscar plan por nombre
   */
  async findByName(name) {
    const plan = await this.planRepo.findByName(name);
    if (!plan) throw new Error('❌ Plan no encontrado');
    return plan;
  }

  /**
   * Acción CRÍTICA:
   * - asignarPlan: debe crear un contrato automáticamente al asignar plan a cliente.
   * - Se ejecuta TODO dentro de una transacción para garantizar consistencia.
   */
  async assignPlanToClient({ clientId, planId, price, conditions }) {
    return withTransaction(async ({ db, session }) => {
      // Repos directos con session para atomicidad
      const contractsColl = db.collection('contracts');
      const clientsColl = db.collection('clients');

      // Validaciones
      const client = await clientsColl.findOne({ _id: clientId }, { session });
      if (!client) throw new Error('Cliente no existe');

      const plan = await this.db.collection('plans').findOne({ _id: planId }, { session });
      if (!plan) throw new Error('Plan no existe');

      // Generar contrato automático
      const newContract = new Contract({
        clientId,
        planId,
        conditions: conditions || 'Contrato por defecto',
        durationMonths: plan.durationMonths,
        price,
        startDate: new Date()
      });

      // Inserción en transacción
      await contractsColl.insertOne(newContract, { session });

      // Actualizar estado del cliente a active
      await clientsColl.updateOne(
        { _id: clientId },
        { $set: { status: 'active' } },
        { session }
      );

      return newContract;
    });
  }

  /**
   * Cancelar plan:
   * - CRÍTICO: debe borrar contrato y borrar/rollback de registros de progreso si corresponde.
   * - TODO dentro de transacción para asegurar consistencia.
   */
  async cancelContract({ contractId, reason = '' }) {
    return withTransaction(async ({ db, session }) => {
      const contractsColl = db.collection('contracts');
      const progressColl = db.collection('progress');
      const clientsColl = db.collection('clients');

      const contract = await contractsColl.findOne({ _id: contractId }, { session });
      if (!contract) throw new Error('Contrato no existe');

      // Marcar contrato como cancelled con motivo
      await contractsColl.updateOne(
        { _id: contractId },
        { $set: { status: 'cancelled', cancelledAt: new Date(), cancelReason: reason } },
        { session }
      );

      // Rollback de progresos asociados
      await progressColl.deleteMany(
        { clientId: contract.clientId, planId: contract.planId },
        { session }
      );

      // Actualizar estado del cliente a inactive si no tiene otros contratos activos
      const activeOther = await contractsColl.findOne(
        { clientId: contract.clientId, status: 'active' },
        { session }
      );
      if (!activeOther) {
        await clientsColl.updateOne(
          { _id: contract.clientId },
          { $set: { status: 'inactive' } },
          { session }
        );
      }

      return { cancelled: true, contractId };
    });
  }
}

module.exports = PlanService;
