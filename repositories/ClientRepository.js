// repositories/ClientRepository.js
// repositories/ClientRepository.js
const GenericRepository = require('./GenericRepository');

class ClientRepository extends GenericRepository {
  constructor(db) {
    super(db.collection('clients'));
  }

  // Buscar por email
  async findByEmail(email) {
    return this.collection.findOne({ 'contact.email': email });
  }

  // Buscar por email o teléfono (ya lo tenías)
  async findByEmailOrPhone(contact) {
    return this.collection.findOne({
      $or: [
        { 'contact.email': contact },
        { 'contact.phone': contact }
      ]
    });
  }

  // Listar todos los clientes
  async findAll() {
    return this.collection.find().toArray();
  }

  // Actualizar cliente por id
  async updateById(id, patch) {
    return this.collection.updateOne({ _id: id }, { $set: patch });
  }

  // Eliminar cliente por id
  async deleteById(id) {
    return this.collection.deleteOne({ _id: id });
  }
}

module.exports = ClientRepository;
