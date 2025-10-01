
import BaseModel from './BaseModel';
import { v4 as uuidv4 } from 'uuid';

class backup extends BaseModel {
  constructor(data = {}) {
    super(data);
    this._id = data._id || uuidv4();
    this.name = data.name;
    this.age = data.age;
    this.contact = data.contact; // {email, phone}
    this.healthNotes = data.healthNotes || '';
    this.status = data.status || 'inactive'; // active/inactive
    this.createdAt = data.createdAt || new Date();
  }

  validateForCreate() {
    this.validateString('name', 'Nombre');
    this.validateNumber('age', 'Edad', true, 0, 120);
    if (!this.contact || typeof this.contact !== 'object') throw new Error('Contact es requerido');
    if (!this.contact.email && !this.contact.phone) throw new Error('Email o teléfono requerido');
  }
}

export default backup;