// Handles user sign-up with email and password
// Validates inputs and stores user data in Firestore

import { auth, db } from "../src/firebase.js";
import {createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  setDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// === Sign-Up Form Handling ===
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get input values
  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const location = document.getElementById("location").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const isBusiness = document.getElementById("isBusiness").checked;
  const isVolunteer = document.getElementById("isVolunteer").checked;

  // Message display helper
  function showMessage(text, type = "error") {
    const box = document.getElementById("message-box");
    box.textContent = text;
    box.className = "";
    box.classList.add("message-box", type);
    setTimeout(() => box.classList.add("hidden"), 4000);
  }
  
  // === Validation ===
  if (!fullName || !phone || !location || !email || !password) {
    showMessage("Please fill in all fields.");
    return;
  }

  // Full name validation
  if (
    fullName.length < 3 ||
    fullName.length > 40 ||
    !/^[a-zA-Z ]+$/.test(fullName) ||
    fullName.split(" ").length < 2 ||
    /\s{2,}/.test(fullName)
  ) {
    showMessage("Please enter a valid full name (2 words, letters only, no double spaces).");
    return;
  }

  // Phone number validation (Israeli format)
  if (!/^[0-9]{10}$/.test(phone) || !phone.startsWith("05")) {
    showMessage("Please enter a valid Israeli phone number (10 digits, starts with 05).");
    return;
  }

  // Location validation
  if (!location) {
    showMessage("Please select your location.");
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage("Please enter a valid email address.");
    return;
  }

  // Password validation
  let pwdErrors = [];
  if (password.length < 8) pwdErrors.push("at least 8 characters");
  if (!/[a-z]/.test(password)) pwdErrors.push("one lowercase letter");
  if (!/[A-Z]/.test(password)) pwdErrors.push("one uppercase letter");
  if (!/[0-9]/.test(password)) pwdErrors.push("one number");
  if (!/[!@#$%^&*]/.test(password)) pwdErrors.push("one special character");

  if (pwdErrors.length) {
    showMessage("Password must contain: " + pwdErrors.join(", "));
    return;
  }

  try {
    // Register user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      userId: user.uid,
      name: fullName,
      phone: phone,
      location: location,
      email: email,
      isBusiness: isBusiness,
      isVolunteer: isVolunteer,
      createdAt: serverTimestamp(),
    });

    showMessage("Signed up successfully!", "success");

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = isVolunteer
      ? "../pages/volunteerTasks.html"
      : "../pages/posts.html";
    }, 1200);

  } catch (error) {
    // Show user-friendly error
    let msg = "Sign-up failed. Please try again.";
    if (error.code === "auth/email-already-in-use") msg = "This email is already in use.";
    if (error.code === "auth/weak-password") msg = "Password is too weak.";
    if (error.code === "auth/invalid-email") msg = "Invalid email address.";

    showMessage(msg, "error");
  }
});

// === Custom Location Dropdown ===
const customDropdown = document.getElementById("custom-location");
const selectedOption = customDropdown.querySelector(".selected-option");
const dropdownOptions = customDropdown.querySelector(".dropdown-options");
const hiddenInput = document.getElementById("location");

// Toggle dropdown display
selectedOption.addEventListener("click", () => {
  dropdownOptions.style.display =
    dropdownOptions.style.display === "block" ? "none" : "block";
});

// Set selected location
dropdownOptions.querySelectorAll(".option").forEach(option => {
  option.addEventListener("click", () => {
    selectedOption.textContent = option.textContent;
    hiddenInput.value = option.dataset.value;
    dropdownOptions.style.display = "none";
  });
});

// Hide dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!customDropdown.contains(e.target)) {
    dropdownOptions.style.display = "none";
  }
});