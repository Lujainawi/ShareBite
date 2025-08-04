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


const welcomeMsg = document.getElementById("welcome-message");
const logoutBtn = document.getElementById("logout-btn");
const postsContainer = document.getElementById("volunteer-posts-container");

let currentUser = null;

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


logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../index.html";
});

document.addEventListener("click", (e) => {
  const modal = document.getElementById("contact-modal");
  if (!modal.classList.contains("hidden") && e.target === modal) {
    modal.classList.add("hidden");
  }
});

function loadVolunteerPosts() {
  const q = query(collection(db, "posts"), where("needsVolunteer", "==", true));
  onSnapshot(q, (snapshot) => {
    postsContainer.innerHTML = "";

    const now = new Date();

    snapshot.forEach(docSnap => {
      const post = docSnap.data();

      const expiry = post.expiry?.toDate();
      if ((expiry && expiry < now) || post.status === "done") return;
      
      postsContainer.innerHTML += `
        <div class="volunteer-card" data-id="${docSnap.id}">
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

window.acceptVolunteer = async function(postId) {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);
  const postData = postSnap.data();

  if (!currentUser || !postData) return;

  const donorSnap = await getDoc(doc(db, "users", postData.userId));
  const donor = donorSnap.exists() ? donorSnap.data() : null;

  const receiverSnap = await getDoc(doc(db, "users", postData.requestedBy));
  const receiver = receiverSnap.exists() ? receiverSnap.data() : null;

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
