// client/js/posts/posts.js
import { auth, db } from "../../src/firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// ======= DOM Elements =======
const welcomeMsg = document.getElementById("welcome-message");
const logoutBtn = document.getElementById("logout-btn");
const addPostBtn = document.getElementById("add-post-btn");
const addPostModal = document.getElementById("add-post-modal");
const addPostForm = document.getElementById("add-post-form");
const closeModalBtn = document.getElementById("close-modal-btn");
const postsContainer = document.getElementById("posts-container");
const myPostsBtn = document.getElementById("my-posts-btn");
const allPostsBtn = document.getElementById("all-posts-btn");

// ======= Auth State =======
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    welcomeMsg.textContent = `Hello, ${user.email}`;
    loadPosts();
  } else {
    window.location.href = "../pages/signIn.html";
  }
});

// ======= Load All Posts =======
function loadPosts() {
  const postsRef = collection(db, "posts");
  onSnapshot(postsRef, (snapshot) => {
    renderPosts(snapshot);
  });
}

// ======= Load My Posts =======
function loadMyPosts() {
  const q = query(collection(db, "posts"), where("userId", "==", currentUser.uid));
  onSnapshot(q, (snapshot) => {
    renderPosts(snapshot);
  });
}

// ======= Render Posts =======
function renderPosts(snapshot) {
  postsContainer.innerHTML = "";
  snapshot.forEach(doc => {
    const post = doc.data();
    postsContainer.innerHTML += `
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <img src="${post.imageUrl}" alt="Food Image">
            <h3>${post.title}</h3>
          </div>
          <div class="flip-card-back">
            <p>${post.description}</p>
            <p><strong>Location:</strong> ${post.location}</p>
            <p><strong>Expiry:</strong> ${post.expiryDate}</p>
          </div>
        </div>
      </div>
    `;
  });
}

// ======= Upload Image to Cloudinary =======
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'default-preset');

  const res = await fetch('https://api.cloudinary.com/v1_1/drqrvsvmz/image/upload', {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  return data.secure_url;
}


// ======= Add Post =======
addPostBtn.addEventListener("click", () => {
  addPostModal.classList.remove("hidden");
});


closeModalBtn.addEventListener("click", () => {
  addPostModal.classList.add("hidden");
});

addPostForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  const file = document.getElementById("image-file").files[0];
  const title = document.getElementById("post-title").value.trim();
  const description = document.getElementById("post-description").value.trim();
  const location = document.getElementById("post-location").value.trim();
  const expiryDate = document.getElementById("post-expiry").value;

  try {
    const imageUrl = await uploadImage(file);
    await addDoc(collection(db, "posts"), {
      userId: currentUser.uid,
      title,
      description,
      location,
      expiryDate,
      imageUrl,
      createdAt: serverTimestamp()
    });

    alert("The post was published successfully 🎉");
    addPostForm.reset();
    addPostModal.classList.add("hidden");
  } catch (error) {
    console.error("Error adding post:", error);
  }
});

// ======= Filter Buttons =======
myPostsBtn.addEventListener("click", () => {
  loadMyPosts();
});
allPostsBtn.addEventListener("click", () => {
  loadPosts();
});

// ======= Logout =======
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../index.html";
});