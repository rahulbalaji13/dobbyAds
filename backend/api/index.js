const app = require('../src/app');
const { connectToDatabase } = require('../src/db');

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
