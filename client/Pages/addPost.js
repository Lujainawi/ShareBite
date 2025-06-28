document.getElementById("post-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value.trim();
  const location = document.getElementById("location").value.trim();
  const expiry = document.getElementById("expiry").value;
  const imageFile = document.getElementById("image").files[0];

  if (!description || !location || !expiry || !imageFile) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    // 1. העלאת תמונה ל־Cloudinary
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "default-preset"); // ודאי שקיים ב־Cloudinary

    const response = await fetch("https://api.cloudinary.com/v1_1/drqrvsvmz/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    const imageUrl = data.secure_url;

    if (!imageUrl) {
      throw new Error("Image upload failed");
    }

    // 2. שמירת פרטי הפוסט ב־Firestore
    const user = firebase.auth().currentUser;
    if (!user) {
      alert("You must be logged in to post.");
      return;
    }

    await firebase.firestore().collection("posts").add({
      uid: user.uid,
      description,
      location,
      expiry: firebase.firestore.Timestamp.fromDate(new Date(expiry)),
      imageUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert("Post added successfully!");
    document.getElementById("post-form").reset();

  } catch (error) {
    console.error("Post submission failed:", error);
    alert("Failed to add post: " + error.message);
  }
});
