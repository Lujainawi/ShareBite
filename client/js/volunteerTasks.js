// This script handles the logic for the volunteer tasks page.
// Volunteers can view food donation requests that need delivery,
// confirm task acceptance, and view contact info for both the donor and the recipient.
//
// Core functionality:
// - Listen to authentication state
// - Load posts marked as 'needsVolunteer: true'
// - Display task details
// - Handle volunteer task acceptance
// - Mark tasks as completed
//
// Dependencies:
// - Firebase Firestore and Auth
// - DOM elements in volunteerTasks.html

import { auth, db } from "../../src/firebase.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc 
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Detects whether a given text contains Hebrew characters
function isHebrew(text) {
  return /[\u0590-\u05FF]/.test(text);
}

// ===== DOM Elements =====
const welcomeMsg = document.getElementById("welcome-message");
const logoutBtn = document.getElementById("logout-btn");
const postsContainer = document.getElementById("volunteer-posts-container");

let currentUser = null;

// ===== Auth State Listener =====
// If user is authenticated, show welcome and load posts.
// Otherwise, redirect to login.
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    let name = user.email;

    if (userSnap.exists()) {
      name = userSnap.data().name || user.email;
    }

    welcomeMsg.textContent = `Hello, ${name}`;
    loadVolunteerPosts();
  } else {
    window.location.href = "../pages/signIn.html";
  }
});

// ===== Logout Button =====
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../index.html";
});

// ===== Modal Background Click (Close modal) =====
document.addEventListener("click", (e) => {
  const modal = document.getElementById("contact-modal");
  if (!modal.classList.contains("hidden") && e.target === modal) {
    modal.classList.add("hidden");
  }
});

// ===== Load Tasks That Need Volunteers =====
// Filters posts where needsVolunteer === true
function loadVolunteerPosts() {
  const q = query(collection(db, "posts"), where("needsVolunteer", "==", true));
  onSnapshot(q, (snapshot) => {
    postsContainer.innerHTML = "";

    const now = new Date();

    snapshot.forEach(docSnap => {
      const post = docSnap.data();
      const expiry = post.expiry?.toDate();

      // Skip expired or already completed posts
      if ((expiry && expiry < now) || post.status === "done") return;
      
      const direction = isHebrew(post.title + post.description) ? 'rtl' : 'ltr';
      const textAlign = direction === 'rtl' ? 'right' : 'left';

      // Append card with task info
      postsContainer.innerHTML += `
        <div class="volunteer-card" data-id="${docSnap.id}" style="direction: ${direction}; text-align: ${textAlign};">
        <h3>${post.title}</h3>
        <p class="status-label">⏳ Waiting for Volunteer</p>
        <p>${post.description}</p>
        <p><strong>Location:</strong> ${post.location}</p>
        <p><strong>Requested by:</strong> ${post.requestedByName || "Unknown"}</p>
        <button onclick="acceptVolunteer('${docSnap.id}')">Accept Task</button>
        </div>
        `;
    });
  });
}

// ===== Accept Task Flow =====
// Triggered when a volunteer clicks "Accept Task"
// Displays modal with pickup and delivery contact details
window.acceptVolunteer = async function(postId) {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);
  const postData = postSnap.data();

  if (!currentUser || !postData) return;

  // Fetch donor and recipient info
  const donorSnap = await getDoc(doc(db, "users", postData.userId));
  const donor = donorSnap.exists() ? donorSnap.data() : null;

  const receiverSnap = await getDoc(doc(db, "users", postData.requestedBy));
  const receiver = receiverSnap.exists() ? receiverSnap.data() : null;

  // Compose the message shown in modal
  let message = `
  <h3>Are you sure you want to take this task? 🤝</h3>
  <hr/>
`;


  if (donor) {
    message += `
      <h4>📦 Pickup From (Donor):</h4>
      <p><strong>Name:</strong> ${donor.name}</p>
      <p><strong>Phone:</strong> ${donor.phone}</p>
      <p><strong>Location:</strong> ${postData.location}</p>
      <hr/>
    `;
  }

  if (receiver) {
    message += `
      <h4>🎯 Deliver To:</h4>
      <p><strong>Name:</strong> ${receiver.name}</p>
      <p><strong>Phone:</strong> ${receiver.phone}</p>
      <p><strong>City:</strong> ${receiver.location || "Not specified"}</p>
    `;
  }

  // Show contact modal
  const contactModal = document.getElementById("contact-modal");
  const contactContent = document.getElementById("contact-modal-content");

  contactContent.innerHTML = `
    ${message}
    <br><br>
    <button onclick="markTaskDone('${postId}')">✅ Done</button>
    <button onclick="document.getElementById('contact-modal').classList.add('hidden')">❌ Cancel</button>
  `;

  contactModal.classList.remove("hidden");
};

// ===== Mark Task as Completed =====
// Updates Firestore to mark the task as done
// Hides modal and removes card from the page
window.markTaskDone = async function(postId) {
  const postRef = doc(db, "posts", postId);

  await updateDoc(postRef, {
    needsVolunteer: false,
    status: "done",
    volunteerId: currentUser.uid
  });

  document.getElementById("contact-modal").classList.add("hidden");

  const card = document.querySelector(`[data-id='${postId}']`);
  if (card) {
    card.remove();
  }

  document.getElementById("done-confirmation-modal").classList.remove("hidden");
};