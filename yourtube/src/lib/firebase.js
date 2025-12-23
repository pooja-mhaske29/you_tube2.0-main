// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCH9CTB8BJpsQcnQBdjAC3QXkGP44JFTDY",
  authDomain: "yourtube-d800a.firebaseapp.com",
  projectId: "yourtube-d800a",
  storageBucket: "yourtube-d800a.firebasestorage.app",
  messagingSenderId: "293448034886",
  appId: "1:293448034886:web:faae217cce312817bff847",
  measurementId: "G-XS0E3RR3JZ"
};

// Initialize Firebase
let app = null;
let analytics = null;
let auth = null;

try {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase App Initialized Successfully!");
} catch (error) {
  console.error("❌ Firebase App Initialization Failed:", error);
}

// Initialize Analytics (only in browser)
if (app && typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    console.log("✅ Firebase Analytics Initialized");
  } catch (error) {
    console.warn("⚠️ Firebase Analytics failed:", error.message);
  }
}

// Initialize Auth
if (app) {
  try {
    auth = getAuth(app);
    
    // IMPORTANT: Set persistence to SESSION (not LOCAL) for account selection
    import('firebase/auth').then(({ setPersistence, browserSessionPersistence }) => {
      setPersistence(auth, browserSessionPersistence)
        .then(() => {
          console.log("✅ Auth persistence set to SESSION");
        })
        .catch((error) => {
          console.error("Error setting persistence:", error);
        });
    });
    
    console.log("✅ Firebase Auth Initialized Successfully!");
  } catch (error) {
    console.error("❌ Firebase Auth Initialization Failed:", error);
  }
} else {
  console.error("❌ Cannot initialize Auth: Firebase app is null");
}

export { app, analytics, auth };
