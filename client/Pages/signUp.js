// מופעל לאחר טעינת Google Maps Autocomplete
function initAutocomplete() {
  const locationInput = document.getElementById("location");
  if (locationInput) {
    const autocomplete = new google.maps.places.Autocomplete(locationInput, {
      componentRestrictions: { country: "il" }, // הגבלה לישראל
      fields: ["formatted_address", "geometry"],
    });

    autocomplete.addListener("place_changed", function () {
      const place = autocomplete.getPlace();
      locationInput.value = place.formatted_address || "";
    });
  }
}

// טיפול בלחיצה על "Sign up with Google"
document.getElementById("googleSignUp").addEventListener("click", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const location = document.getElementById("location").value.trim();
  const isBusiness = document.getElementById("isBusiness").checked;

  if (!fullName || !phone || !location) {
    alert("Please fill in all required fields.");
    return;
  }

  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;

    const userData = {
      uid: user.uid,
      name: fullName,
      phone,
      location,
      email: user.email,
      isBusiness,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await firebase.firestore().collection("users").doc(user.uid).set(userData);
    alert("Sign up successful!");

    // הפנייה לדף הבא – למשל העלאת פוסט
    window.location.href = "addPost.html";

  } catch (error) {
    console.error("Signup failed:", error);
    alert("Signup failed: " + error.message);
  }
});