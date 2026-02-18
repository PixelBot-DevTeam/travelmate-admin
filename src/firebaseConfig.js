// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7fKYFV2INBuklveVyqDNy_x0gewVlCq0",
  authDomain: "travelmate-d8825.firebaseapp.com",
  projectId: "travelmate-d8825",
  storageBucket: "travelmate-d8825.firebasestorage.app",
  messagingSenderId: "1060467853029",
  appId: "1:1060467853029:web:593292bac44fe79a8b360c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth(app);
export const db=getFirestore(app);