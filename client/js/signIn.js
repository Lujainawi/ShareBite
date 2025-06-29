// Sign in with Email
document.getElementById("signin-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert("Signed in successfully!");
    window.location.href = "../pages/posts.html";
  } catch (error) {
    console.error("Error during email sign in:", error);
    alert(error.message);
  }
});

// Sign in with Google
document.getElementById("googleSignIn").addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    if (result.additionalUserInfo.isNewUser && user) {
      await db.collection("users").doc(user.uid).set({
        uid: user.uid,
        name: user.displayName || "",
        phone: "",
        location: "",
        email: user.email,
        isBusiness: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    alert("Signed in with Google!");
    window.location.href = "../pages/posts.html";

  } catch (error) {
    console.error("Error during Google sign in:", error);
    alert(error.message);
  }
});