import { auth, db } from "../src/firebase.js";
import {
  createUserWithEmailAndPassword
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
  const isVolunteer = document.getElementById("isVolunteer").checked;

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
      userId: user.uid,
      name: fullName,
      phone: phone,
      location: location,
      email: email,
      isBusiness: isBusiness,
      isVolunteer: isVolunteer,
      createdAt: serverTimestamp(),
    });

    console.log("User added to Firestore!");
    alert("Sign up successful!");
    if (isVolunteer) {
      window.location.href = "../pages/volunteerTasks.html";
    } else {
      window.location.href = "../pages/posts.html";
    }

  } catch (error) {
    console.error("Error during sign up:", error);
    alert(error.message);
  }
});

// === Custom Dropdown Logic ===
const customDropdown = document.getElementById("custom-location");
const selectedOption = customDropdown.querySelector(".selected-option");
const dropdownOptions = customDropdown.querySelector(".dropdown-options");
const hiddenInput = document.getElementById("location");

// Toggle dropdown
selectedOption.addEventListener("click", () => {
  dropdownOptions.style.display =
    dropdownOptions.style.display === "block" ? "none" : "block";
});

// Pick option
dropdownOptions.querySelectorAll(".option").forEach(option => {
  option.addEventListener("click", () => {
    selectedOption.textContent = option.textContent;
    hiddenInput.value = option.dataset.value;
    dropdownOptions.style.display = "none";
  });
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!customDropdown.contains(e.target)) {
    dropdownOptions.style.display = "none";
  }
});