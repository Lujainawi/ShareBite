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
import { updateDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";



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
    if (expiry && expiry < now) return;
    if (post.status === "done") return;

    const isOwner = currentUser && post.userId === currentUser.uid;
    const statusClass = getStatusClass(post.status);

    postsContainer.innerHTML += `
    <div class="flip-card" data-id="${docSnap.id}" onclick="flipCard(this, event)">
    <div class="flip-card-inner ${statusClass}">
      <div class="flip-card-front">
        <img src="${post.imageUrl}" alt="Food Image">
      </div>
      <div class="flip-card-back">
        <h3>${post.title}</h3>
        <p><strong>Posted by:</strong> <span>${post.userName || "Unknown"}</span></p>
        <p><span>${post.description}</span></p>
        <p><strong>Location:</strong> <span>${post.location}</span></p>
        ${post.status === "waiting-volunteer" ? `<p class="status-label">⏳ <span>Waiting for Volunteer</span></p>` : ""}
        ${post.requestedByName ? `<p><strong>Requested by:</strong> <span>${post.requestedByName}</span></p>` : ""}
        <p><strong>Expiry:</strong> <span>${expiry?.toLocaleString()}</span></p>
        ${isOwner 
          ? `<button onclick="deletePost('${docSnap.id}')">Delete</button>` 
          : post.status === "available"
            ? `<button class="interested-btn" onclick="handleInterested('${docSnap.id}')">I’m interested</button>`
            : ""
        }
        </div>
      </div>
    </div>
    `;
  });
}


// ======= Delete Post =======
let postToDeleteId = null;

window.deletePost = function(postId) {
  postToDeleteId = postId;
  document.getElementById("delete-confirmation-modal").classList.remove("hidden");
};

document.addEventListener("DOMContentLoaded", () => {
  // כפתור אישור מחיקה
  const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

  if (confirmDeleteBtn) {
    confirmDeleteBtn.onclick = async () => {
      if (postToDeleteId) {
        await deleteDoc(doc(db, "posts", postToDeleteId));
        postToDeleteId = null;
        document.getElementById("delete-confirmation-modal").classList.add("hidden");
      }
    };
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.onclick = () => {
      postToDeleteId = null;
      document.getElementById("delete-confirmation-modal").classList.add("hidden");
    };
  }
});


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

let selectedPostId = null; // משתנה גלובלי לשמירת הפוסט

document.addEventListener("DOMContentLoaded", () => {
  const spinner = document.getElementById("global-spinner");
  if (spinner) {
    spinner.classList.add("hidden");
  }

  // חיבור כפתור Need Volunteer
  const needVolunteerBtn = document.getElementById("need-volunteer-btn");
  if (needVolunteerBtn) {
    needVolunteerBtn.onclick = async function () {
      if (!selectedPostId) return;

      const postRef = doc(db, "posts", selectedPostId); 
      const postSnap = await getDoc(postRef);
      const postData = postSnap.data();

      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      const userData = userSnap.exists() ? userSnap.data() : null;

      await updateDoc(postRef, {
        ...postData,
        needsVolunteer: true,
        status: "waiting-volunteer",
        takenBy: null,
        volunteerId: null,
        requestedBy: currentUser.uid,
        requestedByName: userData?.name || currentUser.email
      });

      document.getElementById("confirmation-modal").classList.remove("hidden");
      document.getElementById("interested-modal").classList.add("hidden");
    };
  }

  const cancelBtn = document.getElementById("cancel-modal-btn");
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      document.getElementById("interested-modal").classList.add("hidden");
    };
  }

  document.getElementById("done-task-btn").onclick = async () => {
    const { postId, postData } = window.selectedPostForPickup;
  
    await updateDoc(doc(db, "posts", postId), {
      ...postData,
      status: "done",
      takenBy: currentUser.uid
    });
  
    alert("Thank you! The task has been marked as completed.");
    document.getElementById("contact-modal").classList.add("hidden");
  };
});





addPostForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  document.getElementById("global-spinner").classList.remove("hidden");

  const file = document.getElementById("image-file").files[0];
  const title = document.getElementById("post-title").value.trim();
  const description = document.getElementById("post-description").value.trim();
  const location = document.getElementById("post-location").value.trim();
  const expiryDate = document.getElementById("post-expiry-date").value;
  const expiryTime = document.getElementById("post-expiry-time").value;
  const expiryDateTime = new Date(`${expiryDate}T${expiryTime}:00`);

   const now = new Date();
  const expiryError = document.getElementById("expiry-error");
  expiryError.textContent = ""; // Clear old error
  if (expiryDateTime <= now) {
    expiryError.textContent = "⏳ Please choose a future date and time.";
    document.getElementById("global-spinner").classList.add("hidden");
    return;
  }


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
      createdAt: serverTimestamp(),
      needsVolunteer: false,
      status: "available",
      takenBy: null,
      volunteerId: null
    });

    showSuccessModal("The post was published successfully 🎉");
    addPostForm.reset();
    addPostModal.classList.add("hidden");

  } catch (error) {
    console.error("Error adding post:", error);
    alert("Something went wrong while posting. Please try again.");
  } finally {
    document.getElementById("global-spinner").classList.add("hidden");
  }
});

function showSuccessModal(message) {
  const modal = document.createElement("div");
  modal.className = "custom-success-modal";
  modal.innerHTML = `
    <div class="success-content">
      <p>${message}</p>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => {
    modal.remove();
  }, 2500);
}


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

window.handleInterested = async function(postId) {
  selectedPostId = postId;

  if (!currentUser) {
    if (confirm("You need to sign in first to show interest. Go to sign up?")) {
      window.location.href = "../pages/signUp.html";
    }
    return;
  }

  const modal = document.getElementById("interested-modal");
  modal.classList.remove("hidden");

document.getElementById("take-myself-btn").onclick = async () => {
  const postRef = doc(db, "posts", postId);
  const postSnap = await getDoc(postRef);
  const postData = postSnap.data();

  const userRef = doc(db, "users", postData.userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();

  window.selectedPostForPickup = {
    postId,
    postData,
    donorData: userData 
  };  

  modal.classList.add("hidden");

  const contactModal = document.getElementById("contact-modal");
  const contactContent = document.getElementById("contact-modal-content");

  contactContent.innerHTML = `
    <h3>Contact the Donor</h3>
    <p><strong>Name:</strong> ${userData.name}</p>
    <p><strong>Phone Number:</strong> ${userData.phone}</p>
    <p><strong>Location:</strong> ${postData.location}</p>
    <button onclick="window.location.href='tel:${userData.phone}'">📞 Call Now</button>
    <button onclick="document.getElementById('contact-modal').classList.add('hidden')">Close</button>
  `;

  contactModal.classList.remove("hidden");

  
  await deleteDoc(postRef);
};


console.log("Current user:", currentUser.uid);
console.log("Trying to update:", { needsVolunteer: true, status: "waiting-volunteer" });

  document.getElementById("close-interested-btn").onclick = () => {
    modal.classList.add("hidden");
  };

  console.log("Current user:", currentUser.uid);
  console.log("Trying to update:", { needsVolunteer: true, status: "waiting-volunteer" });

}; 

// Status for posts
function getStatusClass(status) {
  switch (status) {
    case "taken-by-owner": return "gray-card";
    case "waiting-volunteer": return "yellow-card";
    case "in-progress": return "blue-card";
    case "done": return "green-card";
    default: return "";
  }
}

window.flipCard = function(cardElement, event) {
  if (event && (event.target.closest("button") || event.target.tagName === "BUTTON")) return;

  const inner = cardElement.querySelector('.flip-card-inner');
  inner.classList.toggle('is-flipped');
};