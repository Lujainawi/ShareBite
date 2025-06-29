document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const location = document.getElementById("location").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const isBusiness = document.getElementById("isBusiness").checked;

  if (!fullName || !phone || !location || !email || !password) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    await db.collection("users").doc(user.uid).set({
      uid: user.uid,
      name: fullName,
      phone: phone,
      location: location,
      email: email,
      isBusiness: isBusiness,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    alert("Sign up successful!");
    window.location.href = "../pages/posts.html";
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});


document.getElementById("googleSignUp").addEventListener("click", async () => {
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

    alert("Sign up with Google successful!");
    window.location.href = "../pages/posts.html";
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});