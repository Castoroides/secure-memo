// js/theme.js
const themes = {
  light: {
    "--bg-page": "#f2f2f2",
    "--bg-container": "#ffffff",
    "--bg-editor": "#fafafa",
    "--text-main": "#000000"
  },
  dark: {
    "--bg-page": "#111111",
    "--bg-container": "#1e1e1e",
    "--bg-editor": "#2a2a2a",
    "--text-main": "#eeeeee"
  }
};

export function applyTheme(name) {
  const theme = themes[name];
  if (!theme) return;

  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}
