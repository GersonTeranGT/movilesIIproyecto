// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtDCTCNiq5XBjRhqM81IoV4MVzB6Kasj4",
  authDomain: "proyecto-movilesii-64a80.firebaseapp.com",
  databaseURL: "https://proyecto-movilesii-64a80-default-rtdb.firebaseio.com",
  projectId: "proyecto-movilesii-64a80",
  storageBucket: "proyecto-movilesii-64a80.firebasestorage.app",
  messagingSenderId: "247716625201",
  appId: "1:247716625201:web:67899574e243f9d2050e10"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app)

