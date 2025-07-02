// client/js/contact.js
import { db } from '../src/firebase.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const statusMsg = document.getElementById('statusMessage');

    if (name && email && message) {
      try {
        await addDoc(collection(db, "contacts"), {
          name,
          email,
          message,
          timestamp: serverTimestamp()
        });
        statusMsg.innerText = "Your message was sent successfully! 💚";
        form.reset();
      } catch (err) {
        console.error("Error sending message: ", err);
        statusMsg.innerText = "Something went wrong. Please try again!";
      }
    } else {
      statusMsg.innerText = "Please fill out all fields.";
    }
  });
}