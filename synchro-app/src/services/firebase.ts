import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCjGC6KoJQMrQNeYSa5PetcOJq0Qn-HS6E",
    authDomain: "synchro-core.firebaseapp.com",
    projectId: "synchro-core",
    storageBucket: "synchro-core.firebasestorage.app",
    messagingSenderId: "664133502179",
    appId: "1:664133502179:web:96189b68978bbdde52f1d6",
    measurementId: "G-Y1ZK0H1GM6"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
