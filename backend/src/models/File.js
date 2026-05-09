const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  size: { type: Number, required: true },
  url: { type: String, required: true },
  mimetype: { type: String },
  data: { type: Buffer, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
