import { signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { auth } from "./firebase.js";

// ---------- COMMON LOGOUT ----------
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

auth.onAuthStateChanged(user => {
  if (!user) window.location.href = "index.html";
});

// ---------- CONFIG ----------
const TS_API_KEY = "RZEYHG68H19CH7MX";
const TS_CHANNEL = "3309963";
const ALCOHOL_LIMIT = 1450;
const ACCIDENT_LIMIT = 17000;

// ---------- FETCH DASHBOARD DATA ----------
async function updateOverview() {
  try {
    const url = `https://api.thingspeak.com/channels/${TS_CHANNEL}/feeds.json?api_key=${TS_API_KEY}&results=2`;
    const res = await fetch(url);
    const data = await res.json();
    const feeds = data.feeds;
    
    if (feeds.length === 0) return;
    
    const latest = feeds[feeds.length - 1];
    
    // Status text & icon
    const alcVal = Number(latest.field2 || 0);
    const ax = Number(latest.field3 || 0);
    const ay = Number(latest.field4 || 0);
    const az = Number(latest.field5 || 0);
    const acc = Math.sqrt(ax * ax + ay * ay + az * az);
    
    // Map Update (Simulated for this demo, usually comes from field values)
    const lat = 28.6139; // Replace with actual ThingSpeak field if GPS is available
    const lng = 77.2090;
    
    // Update Map iframe source dynamically
    const mapIframe = document.getElementById("gpsMapIframe");
    const newSrc = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=14&output=embed`;
    if (mapIframe && mapIframe.src !== newSrc) {
      mapIframe.src = newSrc;
    }
    const coordsText = document.getElementById("gpsCoords");
    if (coordsText) coordsText.innerText = `${lat}° N, ${lng}° E`;

    // Connection & Time
    const syncDate = new Date(latest.created_at);
    const syncTimeText = syncDate.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    document.getElementById("lastUpdatedText").innerText = syncTimeText;

    // Check online status based on time difference (e.g., > 2 minutes = Offline)
    const now = new Date();
    const diffMs = now - syncDate;
    
    if (diffMs > 2 * 60 * 1000) {
      document.getElementById("connStatusText").innerText = "Offline";
      document.getElementById("connStatusText").className = "text-2xl font-bold text-gray-500 mt-1";
      document.getElementById("cardConnStatus").classList.remove("border-blue-500");
      document.getElementById("cardConnStatus").classList.add("border-gray-500");
    } else {
      document.getElementById("connStatusText").innerText = "Online";
      document.getElementById("connStatusText").className = "text-2xl font-bold text-blue-600 mt-1";
      document.getElementById("cardConnStatus").classList.remove("border-gray-500");
      document.getElementById("cardConnStatus").classList.add("border-blue-500");
    }

  } catch (err) {
    console.error("Error fetching overview:", err);
    document.getElementById("connStatusText").innerText = "Offline";
    document.getElementById("connStatusText").className = "text-2xl font-bold text-gray-500 mt-1";
    document.getElementById("cardConnStatus").classList.remove("border-blue-500");
    document.getElementById("cardConnStatus").classList.add("border-gray-500");
  }
}

updateOverview();
setInterval(updateOverview, 10000); // 10s poll
