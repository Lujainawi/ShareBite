// Handles sign-in with email and password using Firebase Auth
// Redirects users based on their role (volunteer or not)

import { auth, db } from "../src/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Listen to sign-in form submission
document.getElementById("signin-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const messageBox = document.getElementById("message-box");

  // Helper function to display feedback messages
  function showMessage(text, type = "error") {
    messageBox.textContent = text;
    messageBox.className = ""; 
    messageBox.classList.add(type); 
    messageBox.classList.remove("hidden"); 
  }

  // Validation
  if (!email || !password) {
    showMessage("Please fill in all fields.", "error");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("Please enter a valid email address.", "error");
    return;
  }

  try {
    // Try signing in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user profile from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      showMessage("Signed in successfully!", "success");

      // Redirect after short delay based on role
      setTimeout(() => {
        window.location.href = userData.isVolunteer
          ? "../pages/volunteerTasks.html"
          : "../pages/posts.html";
      }, 1000);
    } else {
      showMessage("User profile not found. Please sign up again.", "error");
    }
  } catch (error) {
    console.error("Error during email sign in:", error);

    // Friendly error message for user
    let userMessage = "Sign-in failed. Please check your credentials.";
    if (error.code === "auth/user-not-found") userMessage = "No account found with this email.";
    if (error.code === "auth/wrong-password") userMessage = "Incorrect password.";
    if (error.code === "auth/too-many-requests") userMessage = "Too many attempts. Please try again later.";

    showMessage(userMessage, "error");
  } finally {
    // Optional: Clear password field after attempt for security
    document.getElementById("password").value = "";
  }
});