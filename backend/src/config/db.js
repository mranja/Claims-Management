const mongoose = require('mongoose');
const autoSeedIfEmpty = require('./seedHelper');

const connectDB = async () => {
  let primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/claims_management';

  // Replace '<database>' placeholder automatically if user copied connection string from Atlas
  if (primaryUri.includes('<database>')) {
    primaryUri = primaryUri.replace('<database>', 'claims_management');
  }

  try {
    // Attempt standard connection with 4s server selection timeout
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB Connected to database: ${conn.connection.host}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.warn(`⚠️ Could not connect to primary MongoDB (${error.message}).`);
    console.log(`⚡ Auto-launching MongoMemoryServer in-memory database fallback...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();

      const conn = await mongoose.connect(inMemoryUri);
      console.log(`🚀 Connected to In-Memory MongoDB Server successfully at ${inMemoryUri}`);

      // Auto-seed in-memory database
      await autoSeedIfEmpty();
    } catch (memError) {
      console.error(`❌ In-memory MongoDB launch error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
