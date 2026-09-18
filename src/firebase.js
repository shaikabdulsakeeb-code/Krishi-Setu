import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDG4aRpZ-FOhuW1olhi7TK2smG63sLUYo8",
  authDomain: "krishisetu-6e5c1.firebaseapp.com",
  databaseURL: "https://krishisetu-6e5c1-default-rtdb.firebaseio.com",
  projectId: "krishisetu-6e5c1",
  storageBucket: "krishisetu-6e5c1.firebasestorage.app",
  messagingSenderId: "992177052052",
  appId: "1:992177052052:web:959e03c430edde78005781",
  measurementId: "G-4WKZLZ4N07"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
