const app = require('./app');
const { connectToDatabase } = require('./db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectToDatabase();
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
