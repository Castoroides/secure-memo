// js/settings.js
// =======================================
// Settings State & Apply (NO modal open/close, NO login/logout)
// =======================================

import { applyTheme, applyColorMode } from "./theme.js";
import { setRevealTime, setViewButtonMode } from "./editor.js";
import { showToast } from "./toast.js";

const AVAILABLE_THEMES = ["default", "simple"];
const AVAILABLE_COLOR_MODES = ["system", "light", "dark"];

let inited = false;

let settingsState = {
  theme: "default",
  colorMode: "system",

  // 追加設定
  fontSize: 16,        // 14/16/18/20...
  viewMode: "hold",    // "hold" | "toggle"
  maskTime: 500,       // 0.5秒
  charCount: "show",   // "show" | "hide"
};

// 値の安全化（古いデータや壊れたデータ吸収用）
function normalizeSettings(initial = {}) {
  const theme = AVAILABLE_THEMES.includes(initial.theme) ? initial.theme : "default";
  const colorMode = AVAILABLE_COLOR_MODES.includes(initial.colorMode) ? initial.colorMode : "system";

  const fontSizeNum = Number(initial.fontSize);
  const fontSize = [14, 16, 18, 20].includes(fontSizeNum) ? fontSizeNum : 16;

  const viewMode = initial.viewMode === "toggle" ? "toggle" : "hold";

  const maskTimeNum = Number(initial.maskTime);
  const maskTime = Number.isFinite(maskTimeNum) && maskTimeNum >= 0 ? maskTimeNum : 500;

  const charCount = initial.charCount === "hide" ? "hide" : "show";

  return { theme, colorMode, fontSize, viewMode, maskTime, charCount };
}

function applyAll() {
  // 見た目系
  applyTheme(settingsState.theme);
  applyColorMode(settingsState.colorMode);

  // 文字サイズ（CSS変数）
  document.documentElement.style.setProperty(
    "--editor-font-size",
    `${settingsState.fontSize}px`
  );

  // ビューボタン挙動（長押し/切替）
  setViewButtonMode(settingsState.viewMode);

  // 入力中マスキング時間（ms）
  setRevealTime(settingsState.maskTime);

  // 文字カウンター表示
  document.body.classList.toggle("hide-charcount", settingsState.charCount !== "show");
}

function reflectUI() {
  const themeSelect = document.getElementById("themeSelect");
  const colorModeSelect = document.getElementById("colorModeSelect");
  const fontSizeSelect = document.getElementById("fontSizeSelect");
  const viewModeSelect = document.getElementById("viewModeSelect");
  const maskTimeSelect = document.getElementById("maskTimeSelect");
  const charCountSelect = document.getElementById("charCountSelect");

  if (themeSelect) themeSelect.value = settingsState.theme;
  if (colorModeSelect) colorModeSelect.value = settingsState.colorMode;
  if (fontSizeSelect) fontSizeSelect.value = String(settingsState.fontSize);
  if (viewModeSelect) viewModeSelect.value = settingsState.viewMode;
  if (maskTimeSelect) maskTimeSelect.value = String(settingsState.maskTime);
  if (charCountSelect) charCountSelect.value = settingsState.charCount;
}

function bindOnce() {
  if (inited) return;
  inited = true;

  const themeSelect = document.getElementById("themeSelect");
  const colorModeSelect = document.getElementById("colorModeSelect");
  const fontSizeSelect = document.getElementById("fontSizeSelect");
  const viewModeSelect = document.getElementById("viewModeSelect");
  const maskTimeSelect = document.getElementById("maskTimeSelect");
  const charCountSelect = document.getElementById("charCountSelect");

  const onSaved = () => {
    applyAll();
    window.requestSave?.();
    showToast("保存しました");
  };

  themeSelect?.addEventListener("change", (e) => {
    settingsState.theme = e.target.value;
    onSaved();
  });

  colorModeSelect?.addEventListener("change", (e) => {
    settingsState.colorMode = e.target.value;
    onSaved();
  });

  fontSizeSelect?.addEventListener("change", (e) => {
    const v = Number(e.target.value);
    settingsState.fontSize = Number.isFinite(v) ? v : 16;
    onSaved();
  });

  viewModeSelect?.addEventListener("change", (e) => {
    settingsState.viewMode = e.target.value === "toggle" ? "toggle" : "hold";
    onSaved();
  });

  maskTimeSelect?.addEventListener("change", (e) => {
    const v = Number(e.target.value);
    settingsState.maskTime = Number.isFinite(v) && v >= 0 ? v : 600;
    onSaved();
  });

  charCountSelect?.addEventListener("change", (e) => {
    settingsState.charCount = e.target.value === "hide" ? "hide" : "show";
    onSaved();
  });
}

export function initSettings(initial = {}) {
  // 1) state更新（古いデータも吸収）
  settingsState = normalizeSettings(initial);

  // 2) UI反映（これは毎回やってOK）
  reflectUI();

  // 3) イベント登録（1回だけ）
  bindOnce();

  // 4) 初期適用（分離が重要）
  applyAll();
}

export function getSettingsState() {
  return settingsState;
}


// 課金システム♪
const upgradePrice = document.getElementById("upgradePrice");
if (upgradePrice) upgradePrice.textContent = "¥300"; // 仮

const upgradeBtn = document.getElementById("upgradeBtn");
const restoreBtn = document.getElementById("restorePurchaseBtn");

upgradeBtn?.addEventListener("click", async () => {
  // TODO: 決済処理をここに
  // 仮：広告非表示をONにする
  localStorage.setItem("adsDisabled", "1");
  showToast("広告を非表示にしました（仮）");
  document.body.classList.add("ads-disabled");
});

restoreBtn?.addEventListener("click", async () => {
  // TODO: 購入復元処理
  showToast("購入の復元は準備中です");
});

// 起動時反映
if (localStorage.getItem("adsDisabled") === "1") {
  document.body.classList.add("ads-disabled");
}