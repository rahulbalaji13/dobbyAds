const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let cachedConnection = null;
let cachedMemoryServer = null;

async function getMongoUri() {
  const mongoUri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    if (!mongoUri) throw new Error('MONGODB_URI is required in production.');
    return mongoUri;
  }

  if (mongoUri && mongoUri !== 'mongodb://localhost:27017/folder-system') {
    return mongoUri;
  }

  if (!cachedMemoryServer) {
    cachedMemoryServer = await MongoMemoryServer.create();
  }

  return cachedMemoryServer.getUri();
}

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = await getMongoUri();
  cachedConnection = await mongoose.connect(uri);
  return cachedConnection;
}

module.exports = { connectToDatabase };
