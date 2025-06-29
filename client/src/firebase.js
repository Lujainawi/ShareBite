const firebaseConfig = {
  apiKey: "AIzaSyAYz-fRl3HV1LPos31H8mBylZi5ICnko2k",
  authDomain: "sharebite-ee576.firebaseapp.com",
  projectId: "sharebite-ee576",
  storageBucket: "sharebite-ee576.firebasestorage.app",
  messagingSenderId: "885355239460",
  appId: "1:885355239460:web:9b1b051a53a4ff2c41a0b1",
  measurementId: "G-KQ44Y7W3QS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Make auth & db globals
const auth = firebase.auth();
const db = firebase.firestore();