// client/src/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAYz-fRl3HV1LPos31H8mBylZi5ICnko2k",
    authDomain: "sharebite-ee576.firebaseapp.com",
    projectId: "sharebite-ee576",
    storageBucket: "sharebite-ee576.appspot.com",
    messagingSenderId: "885355239460",
    appId: "1:885355239460:web:9b1b051a53a4ff2c41a0b1",
    measurementId: "G-KQ44Y7W3QS"
  };

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
