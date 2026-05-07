const app = require('./app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    // If no explicit MongoDB URI or it's the default local one without a running instance, use in-memory
    if (!mongoUri || mongoUri === 'mongodb://localhost:27017/folder-system') {
      console.log('Starting in-memory MongoDB instance...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at', mongoUri);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
