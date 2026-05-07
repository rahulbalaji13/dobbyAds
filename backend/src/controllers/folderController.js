const Folder = require('../models/Folder');
const File = require('../models/File');
const mongoose = require('mongoose');

exports.createFolder = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const folder = await Folder.create({
      name,
      user: req.user._id,
      parent: parentId || null
    });
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const parentId = req.query.parentId || null;
    const folders = await Folder.find({ user: req.user._id, parent: parentId });
    const files = await File.find({ user: req.user._id, folder: parentId });
    res.json({ folders, files });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFolderSize = async (req, res) => {
  try {
    const folderId = req.params.id;

    // Check if the folder exists and belongs to the user
    const folder = await Folder.findOne({ _id: folderId, user: req.user._id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // Use aggregation to find all nested folders and calculate size
    const stats = await Folder.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(folderId) } },
      {
        $graphLookup: {
          from: 'folders',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'parent',
          as: 'nestedFolders'
        }
      },
      {
        $project: {
          allFolderIds: {
            $concatArrays: [['$_id'], '$nestedFolders._id']
          }
        }
      },
      {
        $lookup: {
          from: 'files',
          localField: 'allFolderIds',
          foreignField: 'folder',
          as: 'files'
        }
      },
      {
        $project: {
          totalSize: { $sum: '$files.size' }
        }
      }
    ]);

    const totalSize = stats.length > 0 ? stats[0].totalSize : 0;
    res.json({ size: totalSize });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
