import backup from '../models/backup';
import { v4 as uuidv4 } from 'uuid';

class BackupsService {
  constructor(backupRepo, backupcontractRepo, backupprogressRepo) {
    this.backupRepo = backupRepo;
    this.backupcontractRepo = backupcontractRepo;
    this.backupprogressRepo = backupprogressRepo;
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
    await this.backupprogressRepo.create(rec);
    return rec;
  }
  

  async viewProgressByEmail(email) {
    const client = await this.backupRepo.findByEmail(email);
    if (!client) throw new Error('Cliente no encontrado');
  
    const records = await this.backupprogressRepo.find({ clientId: client._id });
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
  

  async createClientbackup(data) {
    const backup = new backup(data);
    backup.validateForCreate();

    // Validar que no exista email o teléfono
    const exists = await this.backupRepo.findByEmailOrPhone(
      data.contact.email || data.contact.phone
    );
    if (exists) throw new Error('Cliente con contacto existente');

    return this.backupRepo.create(backup);
  }

  async listClients() {
    return this.backupRepo.findAll();
  }

  async findByEmail(email) {
    const client = await this.backupRepo.findByEmail(email);
    if (!client) throw new Error('Cliente no encontrado con ese email');
    return client;
  }

  async updateClient(id, patch) {
    return this.backupRepo.updateById(id, patch);
  }

  async deleteClient(id) {
    // Asegurarse de que no tenga contrato activo
    const activeContract = await this.backupcontractRepo.collection.findOne({
      clientId: id,
      status: 'active',
    });
    if (activeContract) throw new Error('No se puede eliminar cliente con contrato activo');

    return this.backupRepo.deleteById(id);
  }

  async getProgress(clientId) {
    return this.backupprogressRepo.collection
      .find({ clientId })
      .sort({ date: 1 })
      .toArray();
  }
}
  

export default BackupsService;
