// Firebase Configuration
// Replace these values with your actual Firebase project configuration
// To get your config:
// 1. Go to Firebase Console (https://console.firebase.google.com/)
// 2. Select your project
// 3. Go to Project Settings > General
// 4. Scroll down to "Your apps" section
// 5. Click on the web app icon (</>) or add a new web app
// 6. Copy the configuration object

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyB3lDzNlKgZz_jvm4sNfFMlVBYMvWDVLsY",
  authDomain: "titan-library.firebaseapp.com",
  databaseURL: "https://titan-library-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "titan-library",
  storageBucket: "titan-library.firebasestorage.app",
  messagingSenderId: "162652688166",
  appId: "1:162652688166:web:9c11f63c9dd42257c7bbe7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
