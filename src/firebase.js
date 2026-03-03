import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCoesC3Eme2RQv6Po_NdAVtDjSnVR7VIUk",
  authDomain: "xelix-project.firebaseapp.com",
  projectId: "xelix-project",
  storageBucket: "xelix-project.firebasestorage.app",
  messagingSenderId: "123326737802",
  appId: "1:123326737802:web:a408ada3d0109125caac73",
  measurementId: "G-QW264ZHQR6",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
