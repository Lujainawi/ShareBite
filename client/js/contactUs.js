// ==========================================
// contact.js – Handles contact form submissions
//
// Users can fill out their name, email, and a message.
// The data is stored in Firestore under the "contacts" collection.
// Feedback is shown to the user based on success/failure.
//
// Core functionality:
// - Listen to form submit
// - Validate input fields
// - Save the message in Firestore
// - Show user feedback
//
// Dependencies:
// - Firebase Firestore
// - HTML form elements with IDs: name, email, message, statusMessage
// ==========================================

import { db } from '../src/firebase.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Get form element
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form field values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const statusMsg = document.getElementById('statusMessage');

    // Simple validation
    if (name && email && message) {
      try {
        // Add contact message to Firestore
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