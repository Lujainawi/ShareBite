// Responsible for redirecting homepage buttons based on user login state and role

import { auth, db } from "../../src/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // Grab buttons by their IDs (defined in index.html)
  const guestBtn = document.getElementById("find-meal-guest-btn");
  const volunteerBtn = document.getElementById("volunteer-entry-btn");
  const userInfoMsg = document.getElementById("user-info-msg");

  if (guestBtn) {
    guestBtn.addEventListener("click", (e) => {
      e.preventDefault();
  
      const isGuest = !auth.currentUser;
      const targetUrl = isGuest
        ? "/pages/posts.html?guest=true"
        : "/pages/posts.html";
  
      const modal = document.getElementById("entry-notice-modal");
      const text = document.getElementById("entry-notice-text");
  
      text.textContent = isGuest
        ? "You are entering as a Guest 👤"
        : "Welcome back! You're entering as a signed-in user 🔐";
  
      modal.classList.add("show");
      modal.classList.remove("hidden");
  
      setTimeout(() => {
        modal.classList.remove("show");
        modal.classList.add("hidden");
        window.location.href = targetUrl;
      }, 2500);
    });
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (userInfoMsg) {
        userInfoMsg.textContent = "You are not signed in. You’ll continue as a guest.";
      }
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      const name = userData.name || user.email;

      if (userInfoMsg) {
        userInfoMsg.innerHTML = `You are currently signed in as <strong>${name}</strong>`;
      }

      if (guestBtn) {
        guestBtn.href = "/pages/posts.html";
      }

      // Redirect volunteer button if user is marked as volunteer
      if (volunteerBtn && userData.isVolunteer === true) {
        // Remove any previous event listeners by replacing the button with a clone
        volunteerBtn.replaceWith(volunteerBtn.cloneNode(true));
      
        // Get the new (clean) version of the button
        const cleanVolunteerBtn = document.getElementById("volunteer-entry-btn");
      
        cleanVolunteerBtn.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = "/pages/volunteerTasks.html";
        });
      }      

    } catch (err) {
      console.error("Error checking user role:", err);
    }
  });
});