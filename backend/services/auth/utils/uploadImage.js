const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { storage } = require('../config/firebase');

/**
 * Upload image to Firebase Storage
 * @param {Object} file - The file object from multer
 * @param {string} path - The path/folder in Firebase Storage
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
const uploadImage = async (file, path) => {
  try {
    if (!file || !file.buffer) {
      throw new Error('No file provided or invalid file object');
    }

    console.log('File object:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Create a reference to the file location in Firebase Storage
    const filename = `${Date.now()}-${file.originalname}`;
    const storageRef = ref(storage, `${path}/${filename}`);
    
    // Upload the file buffer to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file.buffer, {
      contentType: file.mimetype
    });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('File uploaded successfully. URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    throw new Error(`Error uploading image to storage: ${error.message}`);
  }
};

module.exports = { uploadImage };
