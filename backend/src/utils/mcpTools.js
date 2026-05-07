// This file demonstrates how an AI agent using the Model Context Protocol (MCP) 
// could be wired up to interact with our backend APIs.

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Executes an MCP tool call to create a folder.
 * @param {string} token - The user's JWT token
 * @param {string} name - Folder name
 * @param {string} parentId - Parent folder ID
 */
async function mcpCreateFolder(token, name, parentId = null) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/folders`,
      { name, parentId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to create folder: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Executes an MCP tool call to upload an image.
 * @param {string} token - The user's JWT token
 * @param {string} folderId - Destination folder ID
 * @param {string} filePath - Local path to the file
 */
async function mcpUploadImage(token, folderId, filePath) {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    if (folderId) form.append('folderId', folderId);

    const response = await axios.post(
      `${API_BASE_URL}/files/upload`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.response?.data?.message || error.message}`);
  }
}

module.exports = { mcpCreateFolder, mcpUploadImage };
