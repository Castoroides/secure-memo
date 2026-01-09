// js/main.js
// =======================================
// Application Entry Point
// =======================================

import { initAuth, getCurrentUser } from "./auth.js";
import { saveMemo, loadMemo } from "./storage.js";
import { initEditor, getEditorState } from "./editor.js";
import { initSettings, getSettingsState } from "./settings.js";

// ---------------------------------------
// 起動
// ---------------------------------------
initAuth({
  async onLogin(user) {
    // Firestore からロード
    const data = await loadMemo(user.uid);

    // エディタ初期化
    initEditor({
      real: data?.real || "",
      dummy: data?.dummy || ""
    });

    // 設定初期化
    initSettings(data?.settings || {});
  },

  onLogout() {
    // ログアウト時はローカル初期化
    initEditor({
      real: "",
      dummy: ""
    });

    initSettings({});
  }
});

// ---------------------------------------
// 自動保存（エディタ → Firestore）
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

// editor / settings から呼ばせる
window.requestSave = requestSave;
