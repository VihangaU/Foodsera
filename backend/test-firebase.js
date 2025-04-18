require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFsqmDDV7cO6wbz67HHLOVREuW5jIFThw",
  authDomain: "project7-eee11.firebaseapp.com",
  projectId: "project7-eee11",
  storageBucket: "project7-eee11.appspot.com",
  messagingSenderId: "423531569768",
  appId: "1:423531569768:web:16dac89ab632757fd311dd"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

async function testFirebaseStorage() {
  try {
    console.log('Testing Firebase Storage connection...');
    
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for Firebase Storage');
    
    // Read the file
    const fileBuffer = fs.readFileSync(testFilePath);
    
    // Upload to Firebase Storage
    const filename = `test-${Date.now()}.txt`;
    console.log(`Uploading test file: ${filename}`);
    
    const storageRef = ref(storage, `test/${filename}`);
    const snapshot = await uploadBytes(storageRef, fileBuffer);
    console.log('File uploaded successfully');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`Download URL: ${downloadURL}`);
    
    // Clean up
    fs.unlinkSync(testFilePath);
    
    console.log('Firebase Storage test completed successfully');
    return true;
  } catch (error) {
    console.error('Firebase Storage test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return false;
  }
}

// Run the test
testFirebaseStorage()
  .then(success => {
    if (success) {
      console.log('Firebase Storage is working correctly');
      process.exit(0);
    } else {
      console.log('Firebase Storage test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 