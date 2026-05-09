const app = require('./app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    let mongoUri = process.env.MONGODB_URI;
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction && !mongoUri) {
      throw new Error('MONGODB_URI is required in production.');
    }

    if (!mongoUri || mongoUri === 'mongodb://localhost:27017/folder-system') {
      console.log('Starting in-memory MongoDB instance for local development...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
