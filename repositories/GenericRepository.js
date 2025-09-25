// repositories/GenericRepository.js
class GenericRepository {
    constructor(collection) {
      this.collection = collection;
    }
    async findOne(filter) {
      return this.collection.findOne(filter);
    }    
    async create(doc, options = {}) {
      const res = await this.collection.insertOne(doc, options);
      return res.insertedId ? doc : null;
    }
  
    async findById(id) {
      return this.collection.findOne({ _id: id });
    }
  
    async find(filter = {}, opts = {}) {
      return this.collection.find(filter, opts).toArray();
    }
  
    async update(filter, updateDoc, options = {}) {
      await this.collection.updateOne(filter, { $set: updateDoc }, options);
      return this.collection.findOne(filter);
    }
  
    async delete(filter, options = {}) {
      return this.collection.deleteOne(filter, options);
    }
  }
  
  module.exports = GenericRepository;
  