const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const File = require('../models/File');
const { protect } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

    const newFile = await File.create({
      name: req.file.originalname,
      size: req.file.size,
      url: '',
      mimetype: req.file.mimetype,
      data: req.file.buffer,
      user: req.user._id,
      folder: req.body.folderId || null
    });

    newFile.url = `/api/files/${newFile._id}/content`;
    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/content', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid file id' });
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });
    res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
    res.send(file.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
