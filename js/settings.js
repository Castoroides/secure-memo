// js/settings.js
import { applyTheme } from "./theme.js";
import { saveToStorage } from "./storage.js";

export const settings = {
  theme: "light"
};

export function initSettings() {
  const modal = document.getElementById("settingsModal");
  const openBtn = document.getElementById("settingsBtn");
  const closeBtn = modal.querySelector(".close");
  const backdrop = modal.querySelector(".modal-backdrop");

  openBtn.onclick = () => modal.classList.remove("hidden");
  closeBtn.onclick = backdrop.onclick = () =>
    modal.classList.add("hidden");

  document.getElementById("themeSelect").onchange = (e) => {
    settings.theme = e.target.value;
    applyAllSettings();
    persist();
  };
}

export function applyAllSettings(loaded) {
  if (loaded) Object.assign(settings, loaded);
  applyTheme(settings.theme);
}

function persist() {
  saveToStorage({
    settings
  });
}
