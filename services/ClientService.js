// services/ClientService.js
const Client = require('../models/Client');
const { v4: uuidv4 } = require('uuid');

class ClientService {
  constructor(clientRepo, contractRepo, progressRepo) {
    this.clientRepo = clientRepo;
    this.contractRepo = contractRepo;
    this.progressRepo = progressRepo;
  }

  async registerProgress({ clientId, weight, bodyFat, bmi, comments, photoUrl, measurements }) {
    const rec = {
      _id: uuidv4(),
      clientId,
      weight,
      bodyFat,
      bmi,
      comments,
      photoUrl,
      measurements,
      date: new Date()
    };
    await this.progressRepo.create(rec);
    return rec;
  }
  

  async viewProgressByEmail(email) {
    const client = await this.clientRepo.findByEmail(email);
    if (!client) throw new Error('Cliente no encontrado');
  
    const records = await this.progressRepo.find({ clientId: client._id });
    return {
      client,
      records: records.map(r => ({
        _id: r._id,
        date: new Date(r.date),
        weight: r.weight,
        bmi: r.bmi,
        bodyFat: r.bodyFat,
        comments: r.comments,
        photoUrl: r.photoUrl || null,   
        measurements: r.measurements || {}   
      }))
    };
  }
  

  async createClient(data) {
    const client = new Client(data);
    client.validateForCreate();

    // Validar que no exista email o teléfono
    const exists = await this.clientRepo.findByEmailOrPhone(
      data.contact.email || data.contact.phone
    );
    if (exists) throw new Error('Cliente con contacto existente');

    return this.clientRepo.create(client);
  }

  async listClients() {
    return this.clientRepo.findAll();
  }

  async findByEmail(email) {
    const client = await this.clientRepo.findByEmail(email);
    if (!client) throw new Error('Cliente no encontrado con ese email');
    return client;
  }

  async updateClient(id, patch) {
    return this.clientRepo.updateById(id, patch);
  }

  async deleteClient(id) {
    // Asegurarse de que no tenga contrato activo
    const activeContract = await this.contractRepo.collection.findOne({
      clientId: id,
      status: 'active',
    });
    if (activeContract) throw new Error('No se puede eliminar cliente con contrato activo');

    return this.clientRepo.deleteById(id);
  }

  async getProgress(clientId) {
    return this.progressRepo.collection
      .find({ clientId })
      .sort({ date: 1 })
      .toArray();
  }
}
  

module.exports = ClientService;
