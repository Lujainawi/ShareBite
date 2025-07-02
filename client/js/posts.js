// client/js/posts/posts.js
import { auth, db } from "../../src/firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
  deleteDoc
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    let name = user.email;
    if (userSnap.exists()) {
      name = userSnap.data().name;
    }
    welcomeMsg.textContent = `Hello, ${name}`;
    loadPosts();
  } else {
    window.location.href = "../pages/signIn.html";
  }
});

// ======= Load Posts =======
let selectedLocation = "";

function loadPosts() {
  const postsRef = collection(db, "posts");
  onSnapshot(postsRef, (snapshot) => {
    renderPosts(snapshot);
  });
}

function loadMyPosts() {
  const q = query(collection(db, "posts"), where("userId", "==", currentUser.uid));
  onSnapshot(q, (snapshot) => {
    renderPosts(snapshot);
  });
}

function renderPosts(snapshot) {
  postsContainer.innerHTML = "";

  snapshot.forEach(async docSnap => {
    const post = docSnap.data();

    if (
      selectedLocation &&
      post.location?.trim().toLowerCase() !== selectedLocation.trim().toLowerCase()
    ) return;

    const expiry = post.expiry?.toDate();
    const now = new Date();
    if (expiry && expiry < now) {
      await deleteDoc(doc(db, "posts", docSnap.id));
      return;
    }

    const isOwner = post.userId === currentUser.uid;

    postsContainer.innerHTML += `
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <img src="${post.imageUrl}" alt="Food Image">
          </div>
          <div class="flip-card-back">
            <h3>${post.title}</h3>
            <p><strong>Posted by:</strong> ${post.userName || "Unknown"}</p>
            <p>${post.description}</p>
            <p><strong>Location:</strong> ${post.location}</p>
            <p><strong>Expiry:</strong> ${expiry?.toLocaleString()}</p>
            ${isOwner ? `<button onclick="deletePost('${docSnap.id}')">Delete</button>` : ""}
            <button class="interested-btn">I'm interested</button>
          </div>
        </div>
      </div>
    `;
  });
}

// ======= Delete Post =======
window.deletePost = async function(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
    await deleteDoc(doc(db, "posts", postId));
  }
};

// ======= Upload Image =======
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
  const expiryDate = document.getElementById("post-expiry-date").value;
  const expiryTime = document.getElementById("post-expiry-time").value;
  const expiryDateTime = new Date(`${expiryDate}T${expiryTime}:00`);

  try {
    const imageUrl = await uploadImage(file);

    const userSnap = await getDoc(doc(db, "users", currentUser.uid));
    const userName = userSnap.exists() ? userSnap.data().name : currentUser.email;

    await addDoc(collection(db, "posts"), {
      userId: currentUser.uid,
      userName,
      title,
      description,
      location,
      expiry: expiryDateTime,
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

// ======= Filters =======
myPostsBtn.addEventListener("click", () => loadMyPosts());
allPostsBtn.addEventListener("click", () => loadPosts());
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../index.html";
});

// ======= Custom Dropdowns =======
const customPostDropdown = document.getElementById("custom-post-location");
const selectedPostOption = customPostDropdown.querySelector(".selected-option");
const postDropdownOptions = customPostDropdown.querySelector(".dropdown-options");
const hiddenPostLocation = document.getElementById("post-location");

selectedPostOption.addEventListener("click", () => {
  postDropdownOptions.style.display =
    postDropdownOptions.style.display === "block" ? "none" : "block";
});

postDropdownOptions.querySelectorAll(".option").forEach(option => {
  option.addEventListener("click", () => {
    selectedPostOption.textContent = option.textContent;
    hiddenPostLocation.value = option.dataset.value;
    postDropdownOptions.style.display = "none";
  });
});

document.addEventListener("click", (e) => {
  if (!customPostDropdown.contains(e.target)) {
    postDropdownOptions.style.display = "none";
  }
});

const customLocationFilter = document.getElementById("custom-location-filter");
const selectedFilterOption = customLocationFilter.querySelector(".selected-option");
const filterDropdownOptions = customLocationFilter.querySelector(".dropdown-options");

selectedFilterOption.addEventListener("click", () => {
  filterDropdownOptions.style.display =
    filterDropdownOptions.style.display === "block" ? "none" : "block";
});

filterDropdownOptions.querySelectorAll(".option").forEach(option => {
  option.addEventListener("click", () => {
    selectedFilterOption.textContent = option.textContent;
    selectedLocation = option.dataset.value || "";
    filterDropdownOptions.style.display = "none";
    loadPosts();
  });
});

document.addEventListener("click", (e) => {
  if (!customLocationFilter.contains(e.target)) {
    filterDropdownOptions.style.display = "none";
  }
});