import { auth, db } from "../../src/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

let cachedUser = null;
let isVolunteer = false;

document.addEventListener("DOMContentLoaded", () => {
  const volunteerBtn = document.getElementById("volunteer-entry-btn");
  if (!volunteerBtn) return;

  // נשמור את המשתמש מיד כשנטען
  onAuthStateChanged(auth, async (user) => {
    cachedUser = user;
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        isVolunteer = userDoc.exists() && userDoc.data().isVolunteer === true;
      } catch (err) {
        console.error("Error reading user doc:", err);
        isVolunteer = false;
      }
    }
  });

  volunteerBtn.addEventListener("click", () => {
    if (cachedUser && isVolunteer) {
      window.location.href = "/pages/volunteerTasks.html";
    } else {
      window.location.href = "/pages/signIn.html";
    }
  });
});