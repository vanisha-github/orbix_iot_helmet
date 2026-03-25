// js/contacts.js
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    setDoc,
    where
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";

const contactsTableBody = document.getElementById("contactsTableBody");
const contactForm = document.getElementById("contactForm");


// Load contacts only after user is authenticated
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log("Logged-in UID:", user.uid);
    loadContacts(user.uid);
  } else {
    // If not logged in, redirect to login page
    window.location.href = "index.html";
  }
});



// Add new contact
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const relationship = document.getElementById("relationship").value;

  if (!name || !phone) {
    alert("Name and Phone are required!");
    return;
  }

  try {
    const newDocRef = doc(collection(db, "contacts")); // auto-generated ID
    await setDoc(newDocRef, {
      name,
      phone,
      email,
      relationship,
      userId: auth.currentUser.uid  // this ensures rules pass
    });
    contactForm.reset();
    loadContacts(auth.currentUser.uid);
  } catch (err) {
    console.error("Error adding contact:", err);
    alert("Failed to add contact. Check console for details.");
  }
});

// Load contacts for current user
async function loadContacts(userId) {
  contactsTableBody.innerHTML = ""; // Clear previous rows

  try {
    const q = query(collection(db, "contacts"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="5">No contacts added yet.</td>`;
      contactsTableBody.appendChild(tr);
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const contact = docSnap.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${contact.name}</td>
        <td>${contact.phone}</td>
        <td>${contact.email || "-"}</td>
        <td>${contact.relationship || "-"}</td>
        <td>
          <button onclick="deleteContact('${docSnap.id}')">Delete</button>
        </td>
      `;
      contactsTableBody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error loading contacts:", err);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5">Failed to load contacts.</td>`;
    contactsTableBody.appendChild(tr);
  }
}

// Delete contact by document ID
window.deleteContact = async (id) => {
  if (!confirm("Are you sure you want to delete this contact?")) return;

  try {
    await deleteDoc(doc(db, "contacts", id));
    loadContacts(auth.currentUser.uid);
  } catch (err) {
    console.error("Error deleting contact:", err);
    alert("Failed to delete contact. Check console for details.");
  }
};
