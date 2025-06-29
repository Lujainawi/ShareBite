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
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = ""; // clear previous errors

  if (!email || !password) {
    errorDiv.textContent = "Please fill in all fields.";
    return;
  }

  // Optional: simple email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorDiv.textContent = "Please enter a valid email address.";
    return;
  }

 try {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 🔍 שלוף את המסמך של המשתמש
  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (userDoc.exists()) {
    const userData = userDoc.data();

    if (userData.isVolunteer) {
      window.location.href = "../pages/volunteerTasks.html";
    } else {
      window.location.href = "../pages/posts.html";
    }
  } else {
    console.error("No user document found!");
    errorDiv.textContent = "User profile not found. Please sign up again.";
  }

} catch (error) {
  console.error("Error during email sign in:", error);
  errorDiv.textContent = error.message;
}
});
