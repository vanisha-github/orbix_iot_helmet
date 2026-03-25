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
    
    const rsCard = document.getElementById("cardRiderStatus");
    const rsText = document.getElementById("riderStatusText");
    const rsIcon = document.getElementById("iconRiderStatus");
    
    if (acc > ACCIDENT_LIMIT) {
      rsCard.className = "glass-card flex flex-col justify-center items-center border-t-8 border-red-500 py-10 animate-pulse";
      rsText.className = "text-4xl font-bold text-red-600";
      rsText.innerText = "Accident Detected";
      rsIcon.className = "w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-4xl mb-4";
      rsIcon.innerHTML = `<i class="fa-solid fa-car-burst"></i>`;
    } else if (alcVal > ALCOHOL_LIMIT) {
      rsCard.className = "glass-card flex flex-col justify-center items-center border-t-8 border-orange-500 py-10";
      rsText.className = "text-4xl font-bold text-orange-600";
      rsText.innerText = "DUI Detected";
      rsIcon.className = "w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-4xl mb-4";
      rsIcon.innerHTML = `<i class="fa-solid fa-beer-mug-empty"></i>`;
    } else {
      rsCard.className = "glass-card flex flex-col justify-center items-center border-t-8 border-green-500 py-10";
      rsText.className = "text-4xl font-bold text-green-600";
      rsText.innerText = "Safe";
      rsIcon.className = "w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-500 text-4xl mb-4";
      rsIcon.innerHTML = `<i class="fa-solid fa-shield-halved"></i>`;
    }

    // Connection & Time
    document.getElementById("connStatusText").innerText = "Online";
    document.getElementById("cardConnStatus").classList.replace("border-gray-500", "border-blue-500");
    const syncTime = new Date(latest.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    document.getElementById("lastUpdatedText").innerText = syncTime;

  } catch (err) {
    console.error("Error fetching overview:", err);
    document.getElementById("connStatusText").innerText = "Offline";
    document.getElementById("cardConnStatus").classList.replace("border-blue-500", "border-gray-500");
  }
}

updateOverview();
setInterval(updateOverview, 10000); // 10s poll
