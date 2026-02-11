// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDG-8fnxrgaZ919bgRBuPW5hPYimNj-Fd0",
    authDomain: "personalwebdarrell.firebaseapp.com",
    projectId: "personalwebdarrell",
    storageBucket: "personalwebdarrell.firebasestorage.app",
    messagingSenderId: "550513160209",
    appId: "1:550513160209:web:a229565228ee6e84eb81b0",
    measurementId: "G-SLBV0C0CY4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
