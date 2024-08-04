// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAaWBGWji-XLPI7TNdzesc6ZthER3025CQ",
  authDomain: "inventory-tracker-12e9a.firebaseapp.com",
  projectId: "inventory-tracker-12e9a",
  storageBucket: "inventory-tracker-12e9a.appspot.com",
  messagingSenderId: "326132915810",
  appId: "1:326132915810:web:6ce88c76518bb6976a3b3b",
  measurementId: "G-67NTGF13QF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export{firestore,auth}