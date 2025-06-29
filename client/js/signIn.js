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
    await signInWithEmailAndPassword(auth, email, password);
    alert("Signed in successfully!");
    window.location.href = "../pages/posts.html";
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

// Sign in with Google
document.getElementById("googleSignIn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (result.additionalUserInfo.isNewUser && user) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName || "",
        phone: "",
        location: "",
        email: user.email,
        isBusiness: false,
        createdAt: serverTimestamp(),
      });
    }

    alert("Signed in with Google!");
    window.location.href = "../pages/posts.html";

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});