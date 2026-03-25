import { signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { auth } from "./firebase.js";

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

auth.onAuthStateChanged(user => {
  if (!user) window.location.href = "index.html";
});

const TS_API_KEY = "RZEYHG68H19CH7MX";
const TS_CHANNEL = "3309963";
const ALCOHOL_LIMIT = 1450;
const ACCIDENT_LIMIT = 17000;

async function fetchLiveSensors() {
  try {
    const res = await fetch(`https://api.thingspeak.com/channels/${TS_CHANNEL}/feeds.json?api_key=${TS_API_KEY}&results=1`);
    const data = await res.json();
    if(data.feeds.length === 0) return;
    const latest = data.feeds[0];

    const alc = Number(latest.field2 || 0);
    const ldr = Number(latest.field1 || 0);
    const ax = Number(latest.field3 || 0);
    const ay = Number(latest.field4 || 0);
    const az = Number(latest.field5 || 0);
    const acc = Math.sqrt(ax * ax + ay * ay + az * az);

    // Update Alc
    document.getElementById("valAlcohol").innerText = alc;
    const alcPct = Math.min((alc / 2048) * 100, 100);
    document.getElementById("barAlcohol").style.width = alcPct + "%";
    const statAlc = document.getElementById("statAlcohol");
    const boxAlc = document.getElementById("boxAlc");
    if(alc > ALCOHOL_LIMIT) {
      statAlc.innerText = "🚨 HIGH ALCOHOL - Danger!";
      statAlc.className = "mt-4 text-sm font-bold text-red-600";
      document.getElementById("barAlcohol").className = "bg-red-500 h-2";
      boxAlc.classList.add("border-2", "border-red-500");
    } else {
      statAlc.innerText = "✅ Normal Range";
      statAlc.className = "mt-4 text-sm font-bold text-green-600";
      document.getElementById("barAlcohol").className = "bg-green-500 h-2";
      boxAlc.classList.remove("border-2", "border-red-500");
    }

    // Update LDR
    document.getElementById("valLDR").innerText = ldr;
    const statLdr = document.getElementById("statLDR");
    if (ldr > 500) { statLdr.innerText = "🌤 Bright / Day"; statLdr.className = "mt-4 text-sm font-bold text-orange-500"; }
    else { statLdr.innerText = "🌑 Dark / Night"; statLdr.className = "mt-4 text-sm font-bold text-indigo-500"; }

    // Update Accel
    document.getElementById("valAcc").innerText = acc.toFixed(0);
    document.getElementById("valX").innerText = ax.toFixed(0);
    document.getElementById("valY").innerText = ay.toFixed(0);
    document.getElementById("valZ").innerText = az.toFixed(0);
    const boxAcc = document.getElementById("boxAcc");
    if (acc > ACCIDENT_LIMIT) {
      boxAcc.classList.add("border-2", "border-red-500", "bg-red-50");
    } else {
      boxAcc.classList.remove("border-2", "border-red-500", "bg-red-50");
    }

  } catch(e) { console.log(e); }
}

fetchLiveSensors();
setInterval(fetchLiveSensors, 5000); // 5 sec interval for live feeling