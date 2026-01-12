// editor.js
// =======================================
// Masked Editor (Title + Body)
// =======================================

import { showToast } from "./toast.js";

const realTitleInput = document.getElementById("realTitleInput");
const realBodyInput  = document.getElementById("realBodyInput");
const viewTitle = document.getElementById("viewTitle");
const viewBody  = document.getElementById("viewBody");

const viewBtn = document.getElementById("viewBtn");
const copyBtn = document.getElementById("copyBtn");
const charCount = document.getElementById("charCount");

let revealTimerTitle = null;
let revealTimerBody  = null;
let showReal = false;

const state = {
  realTitle: "",
  realBody: "",
  dummy: "",
  dummyTitle: ""
};

// --------------------
// from setting
// --------------------
let revealTimeMs = 500;        // 入力文字の表示時間
let viewMode = "hold";         // "hold" | "toggle"

// 入力中に末尾だけリアルを見せる文字数
function getRevealCount(ms) {
  const t = Number(ms) || 0;
  if (t >= 3000) return 15;
  if (t >= 2000) return 10;
  if (t >= 1000) return 6;
  if (t >= 500)  return 3;
  if (t >= 300)  return 1;
  return 0;
}
export function setViewButtonMode(mode) {
  viewMode = (mode === "toggle") ? "toggle" : "hold";

  // hold に戻した時はリアル表示を解除
  if (viewMode === "hold") {
    showReal = false;
    render({ revealTitle: false, revealBody: false });
  }
}

// 外部から設定変更するAPI
export function setRevealTime(ms) {
  const n = Number(ms);
  revealTimeMs = Number.isFinite(n) && n >= 0 ? n : 600;
}

// 本文ダミーは edit_memo 側から触る想定
export function setDummy(dummyText) {
  state.dummy = String(dummyText ?? "");
  render({ revealTitle: false, revealBody: false });
}
export function getDummy() {
  return state.dummy;
}

// タイトル固定表示用（将来 edit_memo で編集したければこれを使う）
export function setDummyTitle(text) {
  state.dummyTitle = String(text ?? "");
  render({ revealTitle: false, revealBody: false });
}
export function getDummyTitle() {
  return state.dummyTitle;
}
// --------------------
// Utils
// --------------------
function pad2(n) { return String(n).padStart(2, "0"); }

function formatYmd(d) {
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function splitRealToTitleBody(real) {
  const s = String(real ?? "");
  const i = s.indexOf("\n");
  if (i === -1) return { title: s, body: "" };
  return { title: s.slice(0, i), body: s.slice(i + 1) };
}

function joinTitleBodyToReal(title, body) {
  return `${String(title ?? "")}\n${String(body ?? "")}`;
}

function buildDummyStream() {
  // 本文用：空白は詰める（長さ合わせしやすい）
  const src = (state.dummy || "これは普通のメモです。ログインすることでダミーテキストの編集が可能になります。")
    .replace(/\s+/g, "");
  return src.repeat(400);
}

// 本文：改行位置を維持しつつ長さ一致マスク
function maskBody(realText, revealTail) {
  const real = String(realText ?? "");
  const len = real.length;
  if (!len) return "";

  const dummyStream = buildDummyStream();

  // 末尾だけリアルを見せる文字数（改行はカウントから除外）
  const revealCount = revealTail ? getRevealCount(revealTimeMs) : 0;

  // 末尾から「改行以外」を revealCount 個拾って set にする
  const revealIdx = new Set();
  if (revealCount > 0) {
    let got = 0;
    for (let i = len - 1; i >= 0 && got < revealCount; i--) {
      if (real[i] === "\n") continue;
      revealIdx.add(i);
      got++;
    }
  }

  // dummy は非改行文字だけ消費する（改行は real に合わせる）
  let p = 0;
  let out = "";

  for (let i = 0; i < len; i++) {
    const ch = real[i];

    // 改行は必ず維持
    if (ch === "\n") {
      out += "\n";
      continue;
    }

    // reveal対象なら real をそのまま出す
    if (revealIdx.has(i)) {
      out += ch;
      continue;
    }

    // それ以外は dummy で埋める
    out += dummyStream[p] ?? "・";
    p++;
  }

  return out;
}


// タイトル：表示は「常に固定文字列」
// reveal中だけ末尾をリアル末尾で差し替え（表示長は固定のまま）
function getMaskedTitle(revealTail) {
  const base = String(state.dummyTitle || `${formatYmd(new Date())} 新しいメモ`);

  if (!revealTail) return base;

  const revealCount = getRevealCount(revealTimeMs);
  if (revealCount <= 0) return base;

  const realTail = String(state.realTitle || "").slice(-revealCount);
  const baseLen = base.length;
  const tailLen = Math.min(realTail.length, baseLen);

  return base.slice(0, baseLen - tailLen) + realTail.slice(-tailLen);
}

function render({ revealTitle = false, revealBody = false } = {}) {
  if (showReal) {
    viewTitle.innerHTML = escapeHtml(state.realTitle);
    viewBody.innerHTML  = escapeHtml(state.realBody);
    return;
  }

  viewTitle.innerHTML = escapeHtml(getMaskedTitle(revealTitle));
  viewBody.innerHTML  = escapeHtml(maskBody(state.realBody, revealBody));
}

function updateCharCount() {
  if (!charCount) return;
  const real = joinTitleBodyToReal(state.realTitle, state.realBody);
  charCount.textContent = `${real.length}字`;
}

function syncBodyScroll() {
  if (!realBodyInput) return;
  viewBody.scrollTop = realBodyInput.scrollTop;
}

// --------------------
// Public API
// --------------------
export function initEditor(initial = {}) {
  const { title, body } = splitRealToTitleBody(initial.real);

  state.realTitle = title || "";
  state.realBody  = body  || "";
  state.dummy     = initial.dummy || "";

  // dummyTitle が渡ってきたらそれを優先（将来保存対応する前提）
  state.dummyTitle = String(initial.dummyTitle || state.dummyTitle || "");

  // dummyTitle が空なら “今日の新しいメモ” を入れる（固定表示用）
  if (!state.dummyTitle) {
    state.dummyTitle = `${formatYmd(new Date())} 新しいメモ`;
  }

  // 新規メモのデフォルト
  if (initial.isNew && !state.realTitle && !state.realBody) {
    const d = `${formatYmd(new Date())} 新しいメモ`;
    state.realTitle = d;
    state.realBody  = "";
    state.dummyTitle = d; // ★要望：作成時に同型で固定
  }

  realTitleInput.value = state.realTitle;
  realBodyInput.value  = state.realBody;

  render({ revealTitle: false, revealBody: false });
  updateCharCount();
  syncBodyScroll();

  if (initial.isNew) {
    window.requestSave?.();
  }
}

export function getEditorState() {
  return {
    real: joinTitleBodyToReal(state.realTitle, state.realBody),
    dummy: state.dummy,
    dummyTitle: state.dummyTitle
  };
}

// --------------------
// Events
// --------------------
realTitleInput.addEventListener("input", () => {
  const cleaned = realTitleInput.value.replace(/\r?\n/g, "");
  if (cleaned !== realTitleInput.value) {
    realTitleInput.value = cleaned;
  }
  state.realTitle = cleaned;

  const shouldReveal = revealTimeMs > 0;

  render({ revealTitle: shouldReveal, revealBody: false });
  updateCharCount();
  window.requestSave?.();

  clearTimeout(revealTimerTitle);
  if (shouldReveal) {
    revealTimerTitle = setTimeout(() => {
      render({ revealTitle: false, revealBody: false });
    }, revealTimeMs);
  }
});

// タイトル：Enterで本文の文頭へ（改行禁止）
realTitleInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (e.isComposing) return;

  e.preventDefault();
  realBodyInput.focus();
  realBodyInput.setSelectionRange(0, 0);
});

realBodyInput.addEventListener("input", () => {
  state.realBody = realBodyInput.value;

  const shouldReveal = revealTimeMs > 0;

  render({ revealTitle: false, revealBody: shouldReveal });
  updateCharCount();
  window.requestSave?.();

  clearTimeout(revealTimerBody);
  if (shouldReveal) {
    revealTimerBody = setTimeout(() => {
      render({ revealTitle: false, revealBody: false });
    }, revealTimeMs);
  }
});

realBodyInput.addEventListener("scroll", syncBodyScroll);

// viewボタン：長押し/切替
viewBtn?.addEventListener("pointerdown", () => {
  if (viewMode !== "hold") return;
  showReal = true;
  render({ revealTitle: false, revealBody: false });
});
["pointerup", "pointerleave", "pointercancel"].forEach((ev) => {
  viewBtn?.addEventListener(ev, () => {
    if (viewMode !== "hold") return;
    showReal = false;
    render({ revealTitle: false, revealBody: false });
  });
});
viewBtn?.addEventListener("click", () => {
  if (viewMode !== "toggle") return;
  showReal = !showReal;
  render({ revealTitle: false, revealBody: false });
});

// コピー（リアルをコピー）
copyBtn?.addEventListener("click", async () => {
  const text = joinTitleBodyToReal(state.realTitle, state.realBody);
  if (!text.trim()) return;

  try {
    await navigator.clipboard.writeText(text);
    showToast?.("コピーしました");
  } catch {
    showToast?.("コピーに失敗しました");
  }
});

