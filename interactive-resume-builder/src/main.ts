import Form from "./core/form/form";
import Store from "./store/store";
import ThemeManager from "./core/theme/ThemeManager";
import { modernThemeConfig } from "./core/theme/themes/modern";

document.addEventListener("DOMContentLoaded", () => {
  const formRoot = document.getElementById("form-section");
  const resumePreview = document.getElementById("resume-preview");
  const themeRoot = document.getElementById("theme-selection");
  const store = Store.getInstance();

  // Initialize form
  if (formRoot) {
    const form = new Form(formRoot, store.getState("formModel") || {});
    form.build();
  }

  // Initialize theme manager with preview container
  if (resumePreview) {
    const themeManager = ThemeManager.getInstance();
    themeManager.setPreviewContainer(resumePreview as HTMLElement);
    // Apply default theme to preview
    themeManager.setTheme(modernThemeConfig);
  }

  // Initialize theme selection UI
  if (themeRoot) {
    // Theme selector UI will go here
    console.log("Theme selector would initialize here.");
  }

  console.log("Initial Store State:", store.getFullState());
});
