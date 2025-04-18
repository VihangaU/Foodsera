
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFsqmDDV7cO6wbz67HHLOVREuW5jIFThw",
  authDomain: "project7-eee11.firebaseapp.com",
  projectId: "project7-eee11",
  storageBucket: "project7-eee11.firebasestorage.app",
  messagingSenderId: "423531569768",
  appId: "1:423531569768:web:16dac89ab632757fd311dd"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

module.exports = { storage };
