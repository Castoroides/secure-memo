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
import { initShare } from "./share.js";
import { showToast } from "./toast.js";

import { bindModal, openModal, closeModal } from "./modal.js";
import { initSettings, getSettingsState } from "./settings.js";
import { initEditMemo } from "./edit_memo.js";

import { initNotesScreen } from "./notes.js";

// ---------------------------------------
// DOM取得
// ---------------------------------------
const loginBtn = document.getElementById("loginBtn");
const userLabel = document.getElementById("userLabel");

const loginGuideModal = document.getElementById("loginGuideModal");
const closeLoginGuide = document.getElementById("closeLoginGuide");
const guideLoginBtn = document.getElementById("guideLoginBtn");

const accountEmail = document.getElementById("accountEmail");
const logoutBtn = document.getElementById("logoutBtn");

// bottom nav / modals
const editBtn = document.getElementById("editBtn");
const settingsBtn = document.getElementById("settingsBtn");

const editModal = document.getElementById("editModal");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");

// ---------------------------------------
// 画面初期化
// ---------------------------------------
initShare();
initEditMemo();

// ---------------------------------------
// ログイン / ログアウト
// ---------------------------------------
loginBtn.addEventListener("click", async () => {
  try {
    await login();
  } catch {
    showToast("ログインに失敗しました");
  }
});

guideLoginBtn?.addEventListener("click", async () => {
  try {
    await login();
  } catch {
    showToast("ログインに失敗しました");
  }
});

logoutBtn?.addEventListener("click", async () => {
  try {
    await logout();
  } catch {
    showToast("ログアウトに失敗しました");
  }
});

// ---------------------------------------
// login guide（×だけで閉じる）
// ---------------------------------------
closeLoginGuide?.addEventListener("click", () => closeModal(loginGuideModal));

// ---------------------------------------
// 設定 / 編集 共通：ログインガード
// ---------------------------------------
const requireLogin = () => {
  const user = getCurrentUser();
  if (!user) {
    openModal(loginGuideModal);
    return false; // ← bindModal の open を止める
  }
  return true;
};

// ---------------------------------------
// 編集モーダル
// ---------------------------------------
if (editBtn && editModal) {
  bindModal({
    openBtn: editBtn,
    modal: editModal,
    closeBtn: null,
    closeOnBackdrop: false,
    guard: requireLogin,
  });
}

// ---------------------------------------
// 設定モーダル
// ---------------------------------------
if (settingsBtn && settingsModal && closeSettings) {
  bindModal({
    openBtn: settingsBtn,
    modal: settingsModal,
    closeBtn: closeSettings,
    closeOnBackdrop: false,
    guard: requireLogin,
  });
}

// ---------------------------------------
// 認証初期化
// ---------------------------------------
initAuth({
  async onLogin(user) {
    // UI更新
    userLabel.textContent = "";
    loginBtn.style.display = "none";
    accountEmail.textContent = user.email;

    closeModal(loginGuideModal);

    // Firestore からロード
    currentMemoId = "default";
    const data = await loadMemo(user.uid, currentMemoId);
    const isNew = !data;

    if (data?.__incompatible) {
      // ✅ 互換性NG → 初期化して通知
      initEditor({ real: "", dummy: "", isNew: true });
      initSettings({});
      showToast("互換性の関係でデータが復元できませんでした");
    } else {
      const isNew = !data;
      initEditor({
        real: data?.real || "",
        dummy: data?.dummy || "",
        dummyTitle: data?.dummyTitle || "",
        isNew
      });
      initSettings(data?.settings || {});
    }

    // ログイン完了通知
    // window.onLoginForSettings?.();

    // 認証完了 → 表示
    document.body.style.visibility = "visible";

    //showToast("ログインしました");
  },

  onLogout() {
    // UI更新
    userLabel.textContent = "ログインで自動保存機能が有効になります";
    loginBtn.style.display = "flex";
    accountEmail.textContent = "未ログイン";

    closeModal(settingsModal);

    // 初期化
    initEditor({ real: "", dummy: "", isNew: true });
    initSettings({});

    // 非表示
    document.body.style.visibility = "visible";

    showToast("ログアウトしました");
  },

  onReady(user) {
    // 初回が未ログインでも、UIを初期化する（＝テーマ適用/アイコン読込が走る）
    if (!user) {
      userLabel.textContent = "ログインで自動保存機能が有効になります";
      loginBtn.style.display = "flex";
      accountEmail.textContent = "未ログイン";

      initEditor({ real: "", dummy: "", isNew: true });
      initSettings({});
    }

    document.body.style.visibility = "visible";
  }

});

// ---------------------------------------
// 自動保存（editor / settings → Firestore）
// ---------------------------------------
let saveTimer = null;

function getTitleFromReal(realText) {
  const firstLine = String(realText ?? "").split("\n")[0] ?? "";
  const t = firstLine.trim();
  return t || "無題";
}

function requestSave() {
  const user = getCurrentUser();
  if (!user) return;

  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const editor = getEditorState();
    const settings = getSettingsState();

    const title = getTitleFromReal(editor.real);

    await saveMemo(user.uid, currentMemoId ?? "default", {
      title,
      real: editor.real,
      dummyTitle: editor.dummyTitle,
      dummy: editor.dummy,
      settings,
      updatedAt: Date.now()
    });
  }, 500);
}


// ---------------------------------------
// editor.js / settings.js から呼ばせる
// ---------------------------------------
window.requestSave = requestSave;


// ---------------------------------------
// メモ切替
// ---------------------------------------
let currentMemoId = null;

initNotesScreen({
  onSelectMemo(memoId, data, opts = {}) {
    currentMemoId = memoId;
    initEditor({
      real: data?.real || "",
      dummy: data?.dummy || "",
      dummyTitle: data?.dummyTitle || "",
      isNew: !!opts.isNew
    });
  }
});