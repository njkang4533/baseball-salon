import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBc4Sjf5cof3zfNUjWkHs_oNaX_8XwccCY",
  authDomain: "baseball-salon.firebaseapp.com",
  projectId: "baseball-salon",
  storageBucket: "baseball-salon.firebasestorage.app",
  messagingSenderId: "819164897575",
  appId: "1:819164897575:web:a6508a1cdb69f149ea0902",
  measurementId: "G-DXFM69BQ10"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
