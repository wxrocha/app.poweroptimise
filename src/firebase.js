// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyDxgRDc_LFaEvTbut-FChUfls7VY-pOcDQ",
  authDomain: "poweroptimise.firebaseapp.com",
  projectId: "poweroptimise",
  storageBucket: "poweroptimise.firebasestorage.app",
  messagingSenderId: "99837469797",
  appId: "1:99837469797:web:87bf510d0c0f6a1867528c"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
