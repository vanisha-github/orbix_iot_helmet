// Firebase modular v10+
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyDOMxUPZMP33ML50YY2ng9oJ-YgJUMqH70",
  authDomain: "iot-helmet-e39dc.firebaseapp.com",
  projectId: "iot-helmet-e39dc",
  storageBucket: "iot-helmet-e39dc.firebasestorage.app",
  messagingSenderId: "736637428994",
  appId: "1:736637428994:web:ad0054c3d877b4a8d48e1b",
  measurementId: "G-H6VYQH6HF7"
};

// Initialize app
const app = initializeApp(firebaseConfig);

// Export auth object
export const auth = getAuth(app);
export const db = getFirestore(app); // Firestore