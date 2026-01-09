// js/settings.js
// =======================================
// Settings UI & State
// =======================================

// settings.js
import { login, logout, getCurrentUser } from "./auth.js";

let settingsState = {
  theme: "light",
  dummy: ""
};

// -----------------------------
// 初期化
// -----------------------------
export function initSettings(initial = {}) {
  settingsState = {
    theme: initial.theme || "light",
    dummy: initial.dummy || ""
  };

  const modal = document.getElementById("settingsModal");
  const openBtn = document.getElementById("settingsBtn");
  const closeBtn = document.getElementById("closeSettings");
  const logoutBtn = document.getElementById("logoutBtn");

  const themeSelect = document.getElementById("themeSelect");
  const dummySource = document.getElementById("dummySource");
  const accountEmail = document.getElementById("accountEmail");

  const loginGuideModal = document.getElementById("loginGuideModal");
  const closeLoginGuide = document.getElementById("closeLoginGuide");
  const guideLoginBtn = document.getElementById("guideLoginBtn");

  // UI反映
  themeSelect.value = settingsState.theme;
  dummySource.value = settingsState.dummy;

  // -----------------------------
  // 設定を開く
  // -----------------------------
  openBtn?.addEventListener("click", () => {
    const user = getCurrentUser();

  if (!user) {
    loginGuideModal.classList.remove("hidden");
    return;
  }

    accountEmail.textContent = user.email;
    modal.classList.remove("hidden");
  });

  // 閉じる
  closeBtn?.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // -----------------------------
  // ログアウト（アカウント変更）
  // -----------------------------
  logoutBtn?.addEventListener("click", async () => {
    await logout();
    modal.classList.add("hidden");
  });

  // -----------------------------
  // 即時保存
  // -----------------------------
  themeSelect?.addEventListener("change", (e) => {
    settingsState.theme = e.target.value;
    document.documentElement.dataset.theme = settingsState.theme;
    window.requestSave?.();
  });

  dummySource?.addEventListener("input", (e) => {
    settingsState.dummy = e.target.value;
    window.requestSave?.();
  });

  // -----------------------------
  // ログイン案内ミニモーダル
  // -----------------------------
  closeLoginGuide?.addEventListener("click", () => {
    loginGuideModal.classList.add("hidden");
  });

  guideLoginBtn?.addEventListener("click", async () => {
    loginGuideModal.classList.add("hidden");
    await login();
  });
}

// -----------------------------
// 状態取得
// -----------------------------
export function getSettingsState() {
  return settingsState;
}