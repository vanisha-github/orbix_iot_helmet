import { signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { auth } from "./firebase.js";

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    document.getElementById("riderName").innerText = user.displayName || user.email;
    document.getElementById("riderUid").innerText = user.uid;
  }
});

// Mock Boot time
document.getElementById("bootTime").innerText = new Date(Date.now() - 3600000).toLocaleString();

let appStartTime = Date.now();
setInterval(() => {
  let elapsedSec = Math.floor((Date.now() - appStartTime) / 1000);
  let hrs = Math.floor(elapsedSec / 3600);
  let mins = Math.floor((elapsedSec % 3600) / 60);
  document.getElementById("sysUptime").innerText = `${hrs}h ${mins}m`;
}, 60000);
