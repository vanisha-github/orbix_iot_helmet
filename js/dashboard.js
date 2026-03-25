import { signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { auth } from "./firebase.js";

// ---------- LOGOUT ----------
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// Redirect if not logged in
auth.onAuthStateChanged(user => {
  if (!user) window.location.href = "index.html";
});

// ---------- THRESHOLDS ----------
const ALCOHOL_LIMIT = 1450;
const ACCIDENT_LIMIT = 17000;

// ---------- DOM ELEMENTS ----------
const alertTableBody = document.getElementById("alertTableBody");
const sessionTableBody = document.getElementById("sessionTableBody");

// ---------- FETCH ALERTS ----------
async function fetchAlerts() {
  try {
    // Fetch last 20 readings for alcohol and MPU X/Y/Z
    const [alcoholData, mpuXData, mpuYData, mpuZData] = await Promise.all([
      fetch("https://api.thingspeak.com/channels/3309963/fields/2.json?api_key=RZEYHG68H19CH7MX&results=20").then(r => r.json()),
      fetch("https://api.thingspeak.com/channels/3309963/fields/3.json?api_key=RZEYHG68H19CH7MX&results=20").then(r => r.json()),
      fetch("https://api.thingspeak.com/channels/3309963/fields/4.json?api_key=RZEYHG68H19CH7MX&results=20").then(r => r.json()),
      fetch("https://api.thingspeak.com/channels/3309963/fields/5.json?api_key=RZEYHG68H19CH7MX&results=20").then(r => r.json())
    ]);

    alertTableBody.innerHTML = "";

    for (let i = 0; i < alcoholData.feeds.length; i++) {
      const time = alcoholData.feeds[i].created_at;
      const alcohol = Number(alcoholData.feeds[i].field2 || 0);
      const ax = Number(mpuXData.feeds[i]?.field3 || 0);
      const ay = Number(mpuYData.feeds[i]?.field4 || 0);
      const az = Number(mpuZData.feeds[i]?.field5 || 0);

      const acc = Math.sqrt(ax*ax + ay*ay + az*az);
      const localTime = new Date(time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

      // Alcohol Alert
      if (alcohol > ALCOHOL_LIMIT) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${localTime}</td><td>Alcohol</td><td>${alcohol}</td>`;
        alertTableBody.appendChild(tr);
      }

      // Accident Alert
      if (acc > ACCIDENT_LIMIT) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${localTime}</td><td>Accident</td><td>${acc.toFixed(2)}</td>`;
        alertTableBody.appendChild(tr);
      }
    }

  } catch (err) {
    console.error("Error fetching alerts:", err);
  }
}

// ---------- FETCH SESSIONS ----------
async function fetchSessions() {
  try {
    const mpuXData = await fetch("https://api.thingspeak.com/channels/3309963/fields/3.json?api_key=RZEYHG68H19CH7MX&results=100").then(r => r.json());

    sessionTableBody.innerHTML = "";
    let sessions = [];
    let sessionStart = null;
    let prevTime = null;
    const MAX_GAP = 5 * 60 * 1000; // 5 min

    mpuXData.feeds.forEach(feed => {
      if(feed.field3 !== null){
        const currentTime = new Date(feed.created_at);
        if(!sessionStart) sessionStart = currentTime;
        else if(prevTime && currentTime - prevTime > MAX_GAP){
          sessions.push({ start: sessionStart, end: prevTime });
          sessionStart = currentTime;
        }
        prevTime = currentTime;
      }
    });

    if(sessionStart && prevTime) sessions.push({ start: sessionStart, end: prevTime });

    sessions.forEach(sess => {
      const durationMin = Math.floor((sess.end - sess.start)/60000);
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${sess.start.toLocaleString()}</td><td>${sess.end.toLocaleString()}</td><td>${durationMin} min</td>`;
      sessionTableBody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error fetching sessions:", err);
  }
}

// ---------- AUTO REFRESH ----------
fetchAlerts();
setInterval(fetchAlerts, 10000); // every 10 sec

fetchSessions();
setInterval(fetchSessions, 60000); // every 1 min
