import { auth, db } from "../../src/firebase.js";
import {
  collection, query, where, onSnapshot, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const welcomeMsg = document.getElementById("welcome-message");
const logoutBtn = document.getElementById("logout-btn");
const postsContainer = document.getElementById("volunteer-posts-container");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    welcomeMsg.textContent = `Hello, ${user.email}`;
    loadVolunteerPosts();
  } else {
    window.location.href = "../pages/signIn.html";
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../index.html";
});

function loadVolunteerPosts() {
  const q = query(collection(db, "posts"), where("needsVolunteer", "==", true));
  onSnapshot(q, (snapshot) => {
    postsContainer.innerHTML = "";
    snapshot.forEach(docSnap => {
      const post = docSnap.data();
      postsContainer.innerHTML += `
        <div class="volunteer-card">
          <h3>${post.title}</h3>
          <p>${post.description}</p>
          <p><strong>Location:</strong> ${post.location}</p>
          <button onclick="acceptVolunteer('${docSnap.id}')">Accept Task</button>
        </div>
      `;
    });
  });
}

window.acceptVolunteer = async function(postId) {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    needsVolunteer: false,
    status: "in-progress",
    volunteerId: currentUser.uid
  });
  alert("You have accepted this volunteer task!");
};
