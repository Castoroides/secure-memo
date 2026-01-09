// js/auth.js
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { loadFromStorage } from "./storage.js";

let currentUser = null;

export function initAuth() {
  const auth = getAuth();
  const loginBtn = document.getElementById("loginBtn");
  const userLabel = document.getElementById("userLabel");

  loginBtn.onclick = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    currentUser = user;
    userLabel.textContent = user.email;
    loginBtn.style.display = "none";

    await loadFromStorage(user.uid);
  });
}

export function getCurrentUser() {
  return currentUser;
}
