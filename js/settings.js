// js/settings.js
// =======================================
// Settings UI & State
// =======================================

import { applyTheme } from "./theme.js";

const modal = document.getElementById("settingsModal");
const settingsBtn = document.getElementById("settingsBtn");
const closeBtn = document.getElementById("closeSettings");
const backdrop = modal?.querySelector(".modal-backdrop");

const themeSelect = document.getElementById("themeSelect");

const state = {
  theme: "light"
};

export function initSettings(initial = {}) {
  state.theme = initial.theme || "light";

  themeSelect.value = state.theme;
  applyTheme(state.theme);
}

export function getSettingsState() {
  return { ...state };
}

// ---------------------------------------
// Events
// ---------------------------------------

settingsBtn?.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

closeBtn?.addEventListener("click", () => {
  modal.classList.add("hidden");
});

backdrop?.addEventListener("click", () => {
  modal.classList.add("hidden");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modal.classList.add("hidden");
  }
});

themeSelect?.addEventListener("change", () => {
  state.theme = themeSelect.value;
  applyTheme(state.theme);
  window.requestSave?.();
});
