// js/editor.js
import { saveToStorage } from "./storage.js";

const REVEAL_COUNT = 3;
const REVEAL_TIME = 600;

let input;
let display;
let dummySource;
let revealTimer = null;
let showReal = false;

export function initEditor() {
  input = document.getElementById("input");
  display = document.getElementById("display");
  dummySource = document.getElementById("dummySource");

  input.addEventListener("input", onInput);
  input.addEventListener("scroll", syncScroll);

  document.getElementById("toggleBtn").onclick = toggleView;
  document.getElementById("copyBtn").onclick = copyText;
}

function onInput() {
  render(true);
  scheduleMask();
  persist();
}

function render(revealTail = false) {
  if (showReal) {
    display.value = input.value;
    return;
  }

  const len = input.value.length;
  const dummyText =
    (dummySource.value || "これは普通のメモです。").repeat(200);

  let masked = dummyText.slice(0, len);

  if (revealTail && len >= REVEAL_COUNT) {
    masked =
      dummyText.slice(0, len - REVEAL_COUNT) +
      input.value.slice(len - REVEAL_COUNT);
  }

  display.value = masked;
}

function scheduleMask() {
  clearTimeout(revealTimer);
  revealTimer = setTimeout(() => render(false), REVEAL_TIME);
}

function toggleView() {
  showReal = !showReal;
  render(false);
}

function copyText() {
  navigator.clipboard.writeText(input.value);
}

function syncScroll() {
  display.scrollTop = input.scrollTop;
}

function persist() {
  saveToStorage({
    real: input.value,
    dummy: dummySource.value
  });
}

/* 外部操作用 */

export function setEditorContent(text) {
  input.value = text;
  render(false);
}

export function setDummySource(text) {
  dummySource.value = text;
}
