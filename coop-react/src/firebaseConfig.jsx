// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_FIREBASE,
  authDomain: "scholar-save.firebaseapp.com",
  projectId: "scholar-save",
  storageBucket: "scholar-save.firebasestorage.app",
  messagingSenderId: "813813562685",
  appId: "1:813813562685:web:717a8096863639521a5954",
  measurementId: "G-PE45M00QHW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };