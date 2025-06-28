document.getElementById("signin-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    alert("Signed in successfully!");
    window.location.href = "addPost.html"; // או כל דף המשך
  } catch (error) {
    console.error("Sign in failed:", error);
    alert("Error: " + error.message);
  }
});

// טיפול ב־Sign in with Google
document.getElementById("googleSignIn").addEventListener("click", async () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;

    // ניתן לבדוק האם יש מידע ב-Firestore אם צריך
    window.location.href = "addPost.html"; // או דף אחר
  } catch (error) {
    console.error("Google sign-in failed:", error);
    alert("Error: " + error.message);
  }
});