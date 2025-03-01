// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZnJRY16ByVqobVSmwgzX2mOTFZp8yf7o",
  authDomain: "social-media-bot-34170.firebaseapp.com",
  projectId: "social-media-bot-34170",
  storageBucket: "social-media-bot-34170.firebasestorage.app",
  messagingSenderId: "691175949043",
  appId: "1:691175949043:web:369aa27a79fd40b2e82d86",
  measurementId: "G-V7XKY1Q0NG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app; 