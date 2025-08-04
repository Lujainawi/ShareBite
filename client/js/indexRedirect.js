import { auth, db } from "../../src/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const findMealBtn = document.querySelector("a[href='/pages/Posts.html']");
  const volunteerBtn = document.querySelector("a[href='/pages/signUp.html']");

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      if (findMealBtn) {
        findMealBtn.href = "/pages/posts.html";
      }

      if (volunteerBtn && userData.isVolunteer) {
        // מבטל את ההתנהגות הרגילה ומחליף ב־redirect
        volunteerBtn.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = "/pages/volunteerTasks.html";
        });
      }

    } catch (err) {
      console.error("Error checking user role:", err);
    }
  });
});