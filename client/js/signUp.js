import { auth, db } from "../src/firebase.js";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  setDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const location = document.getElementById("location").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const isBusiness = document.getElementById("isBusiness").checked;

  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = ""; // Clear previous errors

  // ✅ Full Name validation
  if (
    fullName.length < 3 ||
    fullName.length > 40 ||
    !/^[a-zA-Z ]+$/.test(fullName) ||
    fullName.split(" ").length < 2 ||
    /\s{2,}/.test(fullName)
  ) {
    errorDiv.textContent = "Please enter a valid full name (2 words, letters only, no double spaces).";
    return;
  }

  // ✅ Phone validation (Israel format)
  if (!/^[0-9]{10}$/.test(phone) || !phone.startsWith("05")) {
    errorDiv.textContent = "Please enter a valid Israeli phone number (10 digits, starts with 05).";
    return;
  }

  // ✅ Location validation
  if (!location) {
    errorDiv.textContent = "Please select your location.";
    return;
  }

  // ✅ Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorDiv.textContent = "Please enter a valid email address.";
    return;
  }

  // ✅ Password validation
  let pwdErrors = [];
  if (password.length < 8) pwdErrors.push("at least 8 characters");
  if (!/[a-z]/.test(password)) pwdErrors.push("one lowercase letter");
  if (!/[A-Z]/.test(password)) pwdErrors.push("one uppercase letter");
  if (!/[0-9]/.test(password)) pwdErrors.push("one number");
  if (!/[!@#$%^&*]/.test(password)) pwdErrors.push("one special character");

  if (pwdErrors.length) {
    errorDiv.textContent = "Password must contain: " + pwdErrors.join(", ");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created:", userCredential);

    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: fullName,
      phone: phone,
      location: location,
      email: email,
      isBusiness: isBusiness,
      createdAt: serverTimestamp(),
    });

    console.log("User added to Firestore!");
    alert("Sign up successful!");
    window.location.href = "../pages/posts.html";

  } catch (error) {
    console.error("Error during sign up:", error);
    alert(error.message);
  }
});

// ✅ Sign up with Google
document.getElementById("googleSignUp").addEventListener("click", async () => {
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

    alert("Sign up with Google successful!");
    window.location.href = "../pages/posts.html";

  } catch (error) {
    console.error("Error during Google sign up:", error);
    errorDiv.textContent = error.message;
  }
});