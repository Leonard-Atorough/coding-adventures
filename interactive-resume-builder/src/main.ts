import Form from "./core/form/Form";
import Preview from "./core/preview/Preview";
import Store from "./store/store";
import ThemeManager from "./core/theme/ThemeManager";
import { modernThemeConfig } from "./core/theme/themes/modern";

document.addEventListener("DOMContentLoaded", () => {
  const formRoot = document.getElementById("form-section");
  const resumePreview = document.getElementById("resume-preview");
  const themeRoot = document.getElementById("theme-selection");
  const store = Store.getInstance();

  if (formRoot) {
    const form = new Form(formRoot, store.getState("formModel") || {});
    form.build();
  }

  if (resumePreview) {
    const themeManager = ThemeManager.getInstance();
    themeManager.setPreviewContainer(resumePreview as HTMLElement);
    themeManager.setTheme(modernThemeConfig);

    const preview = new Preview(resumePreview, store.getState("formModel") || {});
    preview.build();
  }


  if (themeRoot) {
    console.log("Theme selector would initialize here.");
  }

  console.log("Initial Store State:", store.getFullState());
});
