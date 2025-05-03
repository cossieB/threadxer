// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage"
import {getAuth} from "firebase/auth"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZSKaYeKWr_13uNKXjGw89WCnr5msOyhM",
  authDomain: "threadxer.firebaseapp.com",
  projectId: "threadxer",
  storageBucket: "threadxer.appspot.com",
  messagingSenderId: "949782334392",
  appId: "1:949782334392:web:fc5578f2198855e2005d4d",
  measurementId: "G-F0K7YHFYRP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app)
export const firebaseAuth = getAuth(app)