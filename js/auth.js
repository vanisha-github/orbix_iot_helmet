import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { auth } from "./firebase.js"; // <- MUST match export name exactly

// attach functions to window
window.loginUser = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) { alert("Enter email and password!"); return; }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login Success!");
    window.location.href = "dashboard.html";
  } catch (error) {
    alert("Login Failed: " + error.message);
  }
};

window.signupUser = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) { alert("Enter email and password!"); return; }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup Success! You can now login.");
  } catch (error) {
    alert("Signup Failed: " + error.message);
  }
};
