import { auth, db } from "../src/firebase.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  setDoc,
  doc,
  serverTimestamp
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
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "../pages/posts.html";
  } catch (error) {
    console.error("Error during email sign in:", error);
    errorDiv.textContent = error.message;
  }
});

// Sign in with Google
document.getElementById("googleSignIn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = "";

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (result.additionalUserInfo.isNewUser && user) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName || "",
        phone: "",
        location: "",
        email: user.email,
        isBusiness: false,
        createdAt: serverTimestamp(),
      });
    }

    window.location.href = "../pages/posts.html";

  } catch (error) {
    console.error("Error during Google sign in:", error);
    errorDiv.textContent = error.message;
  }
});