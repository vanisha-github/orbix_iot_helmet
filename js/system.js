import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// ---------- COMMON LOGOUT ----------
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// ---------- AUTH STATE & INIT ----------
let currentUserId = null;

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUserId = user.uid;
    await fetchData(user.uid);
    initChart();
  }
});

function showAlert(msg, isError = false) {
  const alertBox = document.getElementById("statusAlert");
  alertBox.className = "mb-6 px-4 py-3 rounded border text-sm font-semibold block " + (isError ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200");
  alertBox.innerHTML = isError ? "<i class='fa-solid fa-circle-exclamation mr-2'></i>" + msg : "<i class='fa-solid fa-circle-check mr-2'></i>" + msg;
  alertBox.classList.remove("hidden");
  setTimeout(() => alertBox.classList.add("hidden"), 3000);
}

// ---------- FETCH DATA ----------
async function fetchData(uid) {
  try {
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      document.getElementById("riderName").value = data.name || ";
      document.getElementById("riderAge").value = data.age || ";
      document.getElementById("riderPhone").value = data.phone || ";
      document.getElementById("riderEmail").value = data.email || ";
      document.getElementById("vehicleNum").value = data.vehicleNumber || ";
      document.getElementById("bloodGroup").value = data.bloodGroup || ";
    }

    const q = query(collection(db, "contacts"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    
    let primaryContact = null;
    let anyContact = null;

    querySnapshot.forEach((docSnap) => {
      const c = docSnap.data();
      if (!anyContact) anyContact = c;
      if (c.priority && c.priority.includes("High")) {
        primaryContact = c;
      }
    });

    const contactToShow = primaryContact || anyContact;
    if (contactToShow) {
      document.getElementById("primaryContactName").innerText = contactToShow.name + (contactToShow.relationship ? " (" + contactToShow.relationship + ")" : ");
      document.getElementById("primaryContactPhone").innerText = contactToShow.phone;
    } else {
      document.getElementById("primaryContactName").innerText = "No Contact Found";
      document.getElementById("primaryContactPhone").innerText = "Please add one in Contacts.";
      document.getElementById("primaryContactPhone").parentElement.parentElement.classList.replace("bg-gray-50", "bg-yellow-50");
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    showAlert("Failed to load rider info.", true);
  }
}

// ---------- SAVE DATA ----------
document.getElementById("saveRiderBtn").addEventListener("click", async () => {
  if (!currentUserId) return;
  const btn = document.getElementById("saveRiderBtn");
  btn.innerHTML = "<i class='fa-solid fa-spinner fa-spin mr-1'></i> Saving...";
  btn.disabled = true;

  try {
    const payload = {
      name: document.getElementById("riderName").value,
      age: document.getElementById("riderAge").value,
      phone: document.getElementById("riderPhone").value,
      email: document.getElementById("riderEmail").value,
      vehicleNumber: document.getElementById("vehicleNum").value,
      bloodGroup: document.getElementById("bloodGroup").value,
      updatedAt: new Date().toISOString()
    };

    const userDocRef = doc(db, "users", currentUserId);
    await setDoc(userDocRef, payload, { merge: true });

    showAlert("Rider information saved successfully.");
  } catch (err) {
    console.error("Error saving rider info:", err);
    showAlert("Failed to save changes. Try again.", true);
  } finally {
    btn.innerHTML = "<i class='fa-solid fa-floppy-disk mr-1'></i> Save Changes";
    btn.disabled = false;
  }
});

// ---------- USAGE CHART ----------
function initChart() {
  const ctx = document.getElementById("weeklyUsageChart").getContext("2d");
  
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = [1.5, 2.0, 1.2, 3.5, 2.1, 4.0, 0.5];

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: days,
      datasets: [{
        label: "Usage Time (Hours)",
        data: hours,
        backgroundColor: "#818cf8", // indigo-400
        hoverBackgroundColor: "#4f46e5", // indigo-600
        borderColor: "transparent",
        borderRadius: 6,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#374151',
          padding: 12,
          titleFont: { size: 13 },
          bodyFont: { size: 14, weight: 'bold' },
          displayColors: false,
          callbacks: {
            label: function(context) {
              const val = context.raw;
              const h = Math.floor(val);
              const m = Math.round((val - h) * 60);
              return "  " + h + "h " + m + "m";
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { borderDashOffset: [2, 4], color: '#e5e7eb' },
          border: { display: false },
          title: { display: true, text: "Hours", color: '#6b7280', font: { weight: 'bold' } }
        },
        x: {
          grid: { display: false },
          border: { display: false }
        }
      }
    }
  });
}
