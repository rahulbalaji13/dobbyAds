const express = require('express');
const router = express.Router();
const { createFolder, getFolders, getFolderSize } = require('../controllers/folderController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createFolder)
  .get(protect, getFolders);

router.get('/:id/size', protect, getFolderSize);

module.exports = router;
