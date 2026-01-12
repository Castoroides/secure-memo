// js/theme.js
// =======================================
// Theme Controller
// =======================================

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  loadThemeIcons(theme, document.documentElement.dataset.colorMode || "light");
}

export function applyColorMode(colorMode = "system") {
  const resolvedMode = resolveColorMode(colorMode);
  document.documentElement.dataset.colorMode = resolvedMode;
  loadThemeIcons(document.documentElement.dataset.theme || "default", resolvedMode);
}

export function applyIcons(root = document) {
  loadThemeIcons(
    document.documentElement.dataset.theme || "default",
    document.documentElement.dataset.colorMode || "light",
    root
  );
}

// ---------------------------------------
// Color Mode
// ---------------------------------------
function resolveColorMode(mode) {
  if (mode === "light" || mode === "dark") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// ---------------------------------------
// Theme Icons
// ---------------------------------------
async function loadThemeIcons(theme, mode, root = document) { // ここではmodeつかってない
  const iconElements = root.querySelectorAll("[data-icon]");

  for (const el of iconElements) {
    const name = el.dataset.icon;
    const url = `/assets/themes/${theme}/icons/${name}.svg`;

    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      let svgText = await res.text();

      el.innerHTML = svgText;
    } catch (err) {
      console.warn(`Icon load failed: ${url}`, err);
    }
  }
}
