import { auth, db } from "../src/firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  setDoc,
  doc,
  serverTimestamp,
  getDoc 
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Sign in with Email
document.getElementById("signin-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const messageBox = document.getElementById("message-box");

  function showMessage(text, type = "error") {
    messageBox.textContent = text;
    messageBox.className = ""; 
    messageBox.classList.add(type); 
    messageBox.classList.remove("hidden"); 
  }

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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      showMessage("Signed in successfully!", "success");

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
    showMessage(error.message, "error");
  }
});
