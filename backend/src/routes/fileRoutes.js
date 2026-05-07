const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/File');
const { protect } = require('../middleware/auth');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const newFile = await File.create({
      name: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      user: req.user._id,
      folder: req.body.folderId || null
    });

    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
