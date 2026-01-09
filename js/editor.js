// js/editor.js
// =======================================
// Editor Logic (Dummy Mask)
// =======================================

import { showToast } from "./toast.js";

const input = document.getElementById("input");
const display = document.getElementById("display");
const dummySource = document.getElementById("dummySource");

const REVEAL_COUNT = 3;
const REVEAL_TIME = 600;

let revealTimer = null;
let showReal = false;

const state = {
  real: "",
  dummy: ""
};

function buildDummyStream() {
  const src = state.dummy || "これは普通のメモです。";
  const cleaned = src.replace(/\s+/g, "");
  return cleaned.repeat(200);
}

function render(revealTail = false) {
  const realText = state.real;
  const len = realText.length;

  if (showReal) {
    display.value = realText;
    return;
  }

  if (!len) {
    display.value = "";
    return;
  }

  const dummyStream = buildDummyStream();
  let masked = dummyStream.slice(0, len);

  if (revealTail) {
    const n = Math.min(REVEAL_COUNT, len);
    masked =
      dummyStream.slice(0, len - n) +
      realText.slice(len - n);
  }

  display.value = masked;
}

export function initEditor(initial = {}) {
  state.real = initial.real || "";
  state.dummy = initial.dummy || "";

  input.value = state.real;
  dummySource.value = state.dummy;

  render(false);
}

export function getEditorState() {
  return { ...state };
}

// ---------------------------------------
// Events
// ---------------------------------------

input.addEventListener("input", () => {
  state.real = input.value;

  render(true);
  window.requestSave?.();

  clearTimeout(revealTimer);
  revealTimer = setTimeout(() => render(false), REVEAL_TIME);
});

input.addEventListener("scroll", () => {
  display.scrollTop = input.scrollTop;
});

dummySource.addEventListener("input", () => {
  state.dummy = dummySource.value;
  render(false);
  window.requestSave?.();
});

// ---------------------------------------
// 表示ボタン処理
// ---------------------------------------
const toggleBtn = document.getElementById("toggleBtn");

toggleBtn?.addEventListener("pointerdown", () => {
  showReal = true;
  display.value = state.real;
});

["pointerup", "pointerleave"].forEach((ev) => {
  toggleBtn?.addEventListener(ev, () => {
    showReal = false;
    render(false);
  });
});

// ---------------------------------------
// コピー機能
// ---------------------------------------
const copyBtn = document.getElementById("copyBtn");

copyBtn?.addEventListener("click", async () => {
  const text = display.value;

  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    showToast("コピーしました");
  } catch (e) {
    showToast("コピーに失敗しました");
  }
});