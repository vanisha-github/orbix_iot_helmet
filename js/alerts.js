import { signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { auth } from "./firebase.js";

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

auth.onAuthStateChanged(user => {
  if (!user) window.location.href = "index.html";
});

// ---------- CHARRT INITS ----------
let chartAlc, chartAcc, chartLdr;
const TS_API_KEY = "RZEYHG68H19CH7MX";
const TS_CHANNEL = "3309963";
const ALCOHOL_LIMIT = 1450;
const ACCIDENT_LIMIT = 17000;

function initCharts() {
  const commonOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { beginAtZero: true } }
  };

  chartAlc = new Chart(document.getElementById("chartAlcData").getContext("2d"), {
    type: "line", data: { labels: [], datasets: [{ data: [], borderColor: "#f97316", tension: 0.2, backgroundColor: "rgba(249, 115, 22, 0.1)", fill: true }] },
    options: { ...commonOptions, plugins: { title: { display: true, text: "Alcohol Sensor History" } } }
  });

  chartAcc = new Chart(document.getElementById("chartAccData").getContext("2d"), {
    type: "line", data: { labels: [], datasets: [{ data: [], borderColor: "#ef4444", tension: 0.2, backgroundColor: "rgba(239, 68, 68, 0.1)", fill: true }] },
    options: { ...commonOptions, plugins: { title: { display: true, text: "G-Force / Acceleration (MPU6050)" } } }
  });

  chartLdr = new Chart(document.getElementById("chartLdrData").getContext("2d"), {
    type: "line", data: { labels: [], datasets: [{ data: [], borderColor: "#eab308", tension: 0.2, backgroundColor: "rgba(234, 179, 8, 0.1)", fill: true }] },
    options: { ...commonOptions, plugins: { title: { display: true, text: "Ambient Light (LDR)" } } }
  });
}

// ---------- FETCH ALERTS & DATA ----------
async function fetchAlerts() {
  try {
    const res = await fetch(`https://api.thingspeak.com/channels/${TS_CHANNEL}/feeds.json?api_key=${TS_API_KEY}&results=40`);
    const data = await res.json();
    
    let totalAlerts = 0;
    const body = document.getElementById("alertTableBody");
    body.innerHTML = "";
    
    const timeLabels = [], dpAlc = [], dpAcc = [], dpLdr = [];
    
    data.feeds.forEach(feed => {
      const time = new Date(feed.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      const alc = Number(feed.field2 || 0);
      const ldr = Number(feed.field1 || 0);
      const ax = Number(feed.field3 || 0), ay = Number(feed.field4 || 0), az = Number(feed.field5 || 0);
      const acc = Math.sqrt(ax*ax + ay*ay + az*az);
      
      timeLabels.push(time); dpAlc.push(alc); dpAcc.push(acc.toFixed(0)); dpLdr.push(ldr);

      if (alc > ALCOHOL_LIMIT || acc > ACCIDENT_LIMIT) {
        totalAlerts++;
        let type = "", val = "", stat = "";
        if (alc > ALCOHOL_LIMIT && acc > ACCIDENT_LIMIT) { type = "🚨 Both"; val = `A:${alc}, G:${acc.toFixed()}`; stat = "Pending"; }
        else if (alc > ALCOHOL_LIMIT) { type = "🍺 Alcohol"; val = `Lvl: ${alc}`; stat = "Sent"; }
        else { type = "💥 Impact"; val = `Force: ${acc.toFixed()}`; stat = "Pending"; }

        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50 border-b";
        tr.innerHTML = `
          <td class="px-4 py-3 whitespace-nowrap">${time}</td>
          <td class="px-4 py-3 font-semibold text-red-600">${type}</td>
          <td class="px-4 py-3 text-gray-800 font-medium">${val}</td>
          <td class="px-4 py-3 text-center"><span class="${stat==='Sent'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'} px-2 py-1 rounded text-xs font-bold uppercase">${stat}</span></td>
        `;
        body.prepend(tr); // Newer top
      }
    });

    if (totalAlerts === 0) body.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500 italic">No alerts recorded.</td></tr>`;
    document.getElementById("totalAlertsText").innerText = totalAlerts;

    chartAlc.data.labels = timeLabels; chartAlc.data.datasets[0].data = dpAlc; chartAlc.update();
    chartAcc.data.labels = timeLabels; chartAcc.data.datasets[0].data = dpAcc; chartAcc.update();
    chartLdr.data.labels = timeLabels; chartLdr.data.datasets[0].data = dpLdr; chartLdr.update();

  } catch (e) { console.error("Error fetching logs", e); }
}

initCharts();
fetchAlerts();
setInterval(fetchAlerts, 15000);
