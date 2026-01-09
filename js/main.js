// js/main.js
// =======================================
// Application Entry Point
// =======================================

import {
  initAuth,
  login,
  logout,
  getCurrentUser
} from "./auth.js";

import { saveMemo, loadMemo } from "./storage.js";
import { initEditor, getEditorState } from "./editor.js";
import { initSettings, getSettingsState } from "./settings.js";

// ---------------------------------------
// DOM取得
// ---------------------------------------
const loginBtn = document.getElementById("loginBtn");
const userLabel = document.getElementById("userLabel");
const settingsBtn = document.getElementById("settingsBtn");

const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const accountEmail = document.getElementById("accountEmail");
const logoutBtn = document.getElementById("logoutBtn");

const loginGuideModal = document.getElementById("loginGuideModal");
const closeLoginGuide = document.getElementById("closeLoginGuide");
const guideLoginBtn = document.getElementById("guideLoginBtn");

// ---------------------------------------
// 共通UI操作
// ---------------------------------------
function openModal(modal) {
  modal.classList.remove("hidden");
}

function closeModal(modal) {
  modal.classList.add("hidden");
}

// ---------------------------------------
// ログイン / ログアウト
// ---------------------------------------
loginBtn.addEventListener("click", login);
guideLoginBtn?.addEventListener("click", login);
logoutBtn?.addEventListener("click", logout);

// ---------------------------------------
// 設定ボタン
// ---------------------------------------
settingsBtn.addEventListener("click", () => {
  const user = getCurrentUser();

  if (!user) {
    openModal(loginGuideModal);
    return;
  }

  openModal(settingsModal);
});

// モーダル閉じる
closeSettings.addEventListener("click", () => closeModal(settingsModal));
closeLoginGuide?.addEventListener("click", () =>
  closeModal(loginGuideModal)
);

// ---------------------------------------
// 認証初期化
// ---------------------------------------
initAuth({
  async onLogin(user) {
    // UI更新
    userLabel.textContent = "自動保存有効";
    loginBtn.style.display = "none";
    accountEmail.textContent = user.email;

    closeModal(loginGuideModal);

    // Firestore からロード
    const data = await loadMemo(user.uid);

    // エディタ初期化
    initEditor({
      real: data?.real || "",
      dummy: data?.dummy || ""
    });

    // 設定初期化
    initSettings(data?.settings || {});

    // ログイン完了通知
    window.onLoginForSettings?.();

    // 認証完了 → 表示
    document.body.style.visibility = "visible";

    showToast("ログインしました");
  },

  onLogout() {
    // UI更新
    userLabel.textContent = "ログインで自動保存機能が有効になります";
    loginBtn.style.display = "flex";
    accountEmail.textContent = "未ログイン";

    closeModal(settingsModal);

    // 初期化
    initEditor({ real: "", dummy: "" });
    initSettings({});

    // 非表示
    document.body.style.visibility = "visible";

    showToast("ログアウトしました");
  }
});

// ---------------------------------------
// 自動保存（editor / settings → Firestore）
// ---------------------------------------
let saveTimer = null;

function requestSave() {
  const user = getCurrentUser();
  if (!user) return;

  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const editor = getEditorState();
    const settings = getSettingsState();

    await saveMemo(user.uid, {
      real: editor.real,
      dummy: editor.dummy,
      settings
    });
  }, 500);
}

// editor.js / settings.js から呼ばせる
window.requestSave = requestSave;
