// config/db.js
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'fitness_db';

const client = new MongoClient(uri, {
  // opciones si se desean
  useUnifiedTopology: true
});

async function connect() {
  if (!client.isConnected && !client.topology?.isConnected) {
    await client.connect();
  }
  const db = client.db(dbName);
  return { client, db };
}

/**
 * helper que recibe una callback y ejecuta en transaction
 * callback recibe {db, session}
 */
async function withTransaction(callback) {
  const { client, db } = await connect();
  const session = client.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      result = await callback({ db, session });
    });
    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = { connect, withTransaction, client };
