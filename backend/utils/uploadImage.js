
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../config/firebase');

/**
 * Upload image to Firebase Storage
 * @param {Buffer} file - The file buffer to upload
 * @param {string} path - The path/folder in Firebase Storage
 * @param {string} filename - The filename to save the file as
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
const uploadImage = async (file, path, filename) => {
  try {
    const storageRef = ref(storage, `${path}/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Error uploading image to storage');
  }
};

module.exports = { uploadImage };
