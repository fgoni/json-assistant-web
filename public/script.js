const THEME_STORAGE_KEY = "theme";

function getCurrentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function setTheme(nextTheme) {
  const theme = nextTheme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
  }
  updateThemeToggle(theme);
  updateScreenshotPreview();
  updateScreenshots();
}

function updateThemeToggle(theme) {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;
  toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
}

function getPreviewMode() {
  const root = document.documentElement;
  const mode = root.dataset.previewMode;
  if (mode === "light" || mode === "dark") return mode;
  return "auto";
}

function setPreviewMode(mode) {
  const next = mode === "light" || mode === "dark" ? mode : "auto";
  document.documentElement.dataset.previewMode = next;
  updateScreenshotPreview();
  updateScreenshots();
}

function updateScreenshotPreview() {
  const active = getPreviewMode();
  document
    .querySelectorAll("[data-preview]")
    .forEach((button) =>
      button.setAttribute(
        "aria-selected",
        button.dataset.preview === active ? "true" : "false",
      ),
    );
}

function resolveShotTheme() {
  const preview = getPreviewMode();
  if (preview === "light" || preview === "dark") return preview;
  return getCurrentTheme();
}

function markShotMissing(wrapper) {
  if (!wrapper) return;
  wrapper.setAttribute("data-shot-missing", "true");
  wrapper.removeAttribute("data-shot-loaded");
}

function markShotLoading(wrapper) {
  if (!wrapper) return;
  wrapper.removeAttribute("data-shot-loaded");
  wrapper.removeAttribute("data-shot-missing");
}

function markShotLoaded(wrapper) {
  if (!wrapper) return;
  wrapper.setAttribute("data-shot-loaded", "true");
  wrapper.removeAttribute("data-shot-missing");
}

function updateScreenshots() {
  document.querySelectorAll("img[data-shot]").forEach((img) => {
    const wrapper = img.closest("[data-shot-wrap]");
    if (!wrapper) return;

    const theme = wrapper.hasAttribute("data-shot-preview")
      ? resolveShotTheme()
      : getCurrentTheme();

    const lightSrc = img.dataset.shotLight;
    const darkSrc = img.dataset.shotDark;
    const nextSrc = theme === "dark" ? darkSrc : lightSrc;
    if (!nextSrc) return;

    if (!img.dataset.shotBound) {
      img.dataset.shotBound = "true";
      img.addEventListener("error", () => markShotMissing(wrapper), {
        passive: true,
      });
      img.addEventListener("load", () => markShotLoaded(wrapper), {
        passive: true,
      });
    }

    const currentSrc = img.getAttribute("src");
    const isChanging = currentSrc !== nextSrc;
    if (isChanging) {
      markShotLoading(wrapper);
      img.setAttribute("src", nextSrc);
    }

    if (img.complete) {
      if (img.naturalWidth === 0) markShotMissing(wrapper);
      else markShotLoaded(wrapper);
    }
  });
}

function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function initTheme() {
  updateThemeToggle(getCurrentTheme());
}

function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  toggle.addEventListener(
    "click",
    () => setTheme(getCurrentTheme() === "dark" ? "light" : "dark"),
    { passive: true },
  );
}

function initPreviewSwitcher() {
  document.querySelectorAll("[data-preview]").forEach((button) => {
    button.addEventListener(
      "click",
      () => setPreviewMode(button.dataset.preview),
      { passive: true },
    );
  });
}

setYear();
initTheme();
initThemeToggle();
initPreviewSwitcher();
updateScreenshotPreview();
updateScreenshots();
