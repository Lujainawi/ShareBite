// Handles redirection when the "Become a Volunteer" button is clicked.
// If the user is logged in and is a volunteer → go to volunteerTasks.html
// Else → go to signIn.html

import { auth, db } from "../../src/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

let cachedUser = null;
let isVolunteer = false;

document.addEventListener("DOMContentLoaded", () => {
  const volunteerBtn = document.getElementById("volunteer-entry-btn");
  if (!volunteerBtn) return; // Button not found in DOM

  // Wait for Firebase Auth to load the current user
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // User not logged in → go to sign in
      volunteerBtn.addEventListener("click", () => {
        window.location.href = "/pages/signIn.html";
      });
      return;
    }

    try {
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const isVolunteer = userDoc.exists() && userDoc.data().isVolunteer === true;

      // Add listener to redirect based on role
      volunteerBtn.replaceWith(volunteerBtn.cloneNode(true));
      const cleanVolunteerBtn = document.getElementById("volunteer-entry-btn");

      cleanVolunteerBtn.addEventListener("click", () => {
        if (isVolunteer) {
          window.location.href = "/pages/volunteerTasks.html";
        } else {
          window.location.href = "/pages/signIn.html";
        }
      });

    } catch (err) {
      console.error("Error reading user document:", err);
      // Fallback in case of error
      volunteerBtn.addEventListener("click", () => {
        window.location.href = "/pages/signIn.html";
      });
    }
  });
});