// config/withTransaction.js
async function withTransaction(db, fn) {
    const session = db.client.startSession();
    let result;
    try {
      await session.withTransaction(async () => {
        result = await fn(session);
      });
    } finally {
      await session.endSession();
    }
    return result;
  }
  
  module.exports = withTransaction;
  