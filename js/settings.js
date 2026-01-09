// js/settings.js
// =======================================
// Settings UI & State
// =======================================

// settings.js
import { login, logout } from "./auth.js";

const settingsModal = document.getElementById("settingsModal");
const loginGuideModal = document.getElementById("loginGuideModal");

export function initSettings() {
  document.getElementById("settingsBtn").addEventListener("click", () => {
    if (!window.currentUser) {
      openLoginGuide();
      return;
    }
    openSettings();
  });

  document.getElementById("closeSettings")
    .addEventListener("click", closeSettings);

  settingsModal.querySelector(".modal-backdrop")
    .addEventListener("click", closeSettings);

  document.getElementById("closeLoginGuide")
    .addEventListener("click", closeLoginGuide);

  loginGuideModal.querySelector(".modal-backdrop")
    .addEventListener("click", closeLoginGuide);

  document.getElementById("guideLoginBtn")
    .addEventListener("click", async () => {
      await login();
      closeLoginGuide();
      openSettings(); // ログイン後に自動で設定を開く
    });

  document.getElementById("logoutBtn")
    ?.addEventListener("click", async () => {
      await logout();
      closeSettings();
    });
}

function openSettings() {
  settingsModal.classList.remove("hidden");

  const emailEl = document.getElementById("accountEmail");
  if (emailEl && window.currentUser) {
    emailEl.textContent = window.currentUser.email;
  }
}

function closeSettings() {
  settingsModal.classList.add("hidden");
}

function openLoginGuide() {
  loginGuideModal.classList.remove("hidden");
}

function closeLoginGuide() {
  loginGuideModal.classList.add("hidden");
}