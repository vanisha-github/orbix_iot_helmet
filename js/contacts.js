// js/contacts.js
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { auth, db } from "./firebase.js";

const form = document.getElementById("contactForm");
const contactsGrid = document.getElementById("contactsGrid");
const editIdInput = document.getElementById("editId");
const formTitle = document.getElementById("formTitle");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

// ---------- LOGOUT ----------
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// Load contacts
auth.onAuthStateChanged((user) => {
  if (user) {
    loadContacts(user.uid);
  } else {
    window.location.href = "index.html";
  }
});

// Load Contacts from Firestore
async function loadContacts(userId) {
  try {
    const q = query(collection(db, "contacts"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    contactsGrid.innerHTML = "";

    if (querySnapshot.empty) {
      contactsGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-gray-400">
          <i class="fa-regular fa-address-book text-4xl mb-3"></i>
          <p class="text-lg">No emergency contacts found.</p>
          <p class="text-sm">Add one using the form to get started.</p>
        </div>`;
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const contact = docSnap.data();
      const id = docSnap.id;
      
      const isHighPriority = contact.priority && contact.priority.includes("High");
      const priorityBadge = isHighPriority 
        ? `<span class="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200">Primary</span>`
        : `<span class="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200">Standard</span>`;

      const card = document.createElement("div");
      card.className = `border rounded-xl p-4 bg-white relative shadow-sm transition hover:shadow-md ${isHighPriority ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-indigo-400'}`;
      
      card.innerHTML = `
        <div class="absolute top-3 right-3 flex gap-2">
          <button class="text-gray-400 hover:text-indigo-600 transition" onclick="editContact('${id}', '${contact.name}', '${contact.phone}', '${contact.priority || 'Standard'}', '${contact.relationship || ''}')" title="Edit">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="text-gray-400 hover:text-red-600 transition" onclick="deleteContact('${id}')" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
            ${contact.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-lg flex items-center gap-2">
              ${contact.name}
            </h3>
            <p class="text-gray-500 text-sm mb-1">${contact.relationship || "No relationship set"}</p>
            ${priorityBadge}
          </div>
        </div>
        
        <div class="mt-4 pt-3 border-t flex flex-col gap-2">
          <div class="flex items-center text-gray-700 text-sm">
            <i class="fa-solid fa-phone w-5 text-gray-400"></i> 
            <span class="font-medium">${contact.phone}</span>
          </div>
        </div>
      `;
      contactsGrid.appendChild(card);
    });

  } catch (err) {
    console.error("Error loading contacts:", err);
    contactsGrid.innerHTML = `<div class="col-span-full py-8 text-center text-red-500">Failed to load contacts.</div>`;
  }
}

// Add or Edit Contact
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const idToEdit = editIdInput.value;
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const priority = document.getElementById("priority").value;
  const relationship = document.getElementById("relationship").value.trim();

  if (!name || !phone) return;

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in!");

  const payload = { name, phone, priority, relationship, userId: user.uid };

  try {
    saveBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...`;
    saveBtn.disabled = true;

    if (idToEdit) {
      // Update
      await updateDoc(doc(db, "contacts", idToEdit), payload);
    } else {
      // Create
      const newDocRef = doc(collection(db, "contacts"));
      await setDoc(newDocRef, payload);
    }

    resetForm();
    loadContacts(user.uid);
  } catch (err) {
    console.error("Error saving contact:", err);
    alert("Failed to save contact.");
  } finally {
    saveBtn.disabled = false;
  }
});

// Edit Setup (Global window scope for inline onclick bind)
window.editContact = (id, name, phone, priority, rel) => {
  editIdInput.value = id;
  document.getElementById("name").value = name;
  document.getElementById("phone").value = phone;
  document.getElementById("priority").value = priority;
  document.getElementById("relationship").value = rel;

  formTitle.innerText = "Edit Contact";
  saveBtn.innerHTML = `<i class="fa-solid fa-check mr-1"></i> Update Contact`;
  cancelBtn.classList.remove("hidden");
  
  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Reset Form
function resetForm() {
  form.reset();
  editIdInput.value = "";
  formTitle.innerText = "Add New Contact";
  saveBtn.innerHTML = `<i class="fa-solid fa-plus mr-1"></i> Save Contact`;
  cancelBtn.classList.add("hidden");
}

cancelBtn.addEventListener("click", resetForm);

// Delete Contact (Global window scope)
window.deleteContact = async (id) => {
  if (!confirm("Are you sure you want to completely remove this emergency contact?")) return;

  try {
    await deleteDoc(doc(db, "contacts", id));
    loadContacts(auth.currentUser.uid);
  } catch (err) {
    console.error("Error deleting contact:", err);
    alert("Failed to delete contact.");
  }
};
