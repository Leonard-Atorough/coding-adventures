import Form from "./core/form/form";
import FormModelBuilder from "./core/form/formModelBuilder";
import Preview from "./core/preview/Preview";
import Store from "./store/store";
import ThemeManager from "./core/theme/ThemeManager";
import { modernThemeConfig } from "./core/theme/themes/modern";
import type { FormModel } from "./types";

document.addEventListener("DOMContentLoaded", () => {
  const formRoot = document.getElementById("form-section");
  const resumePreview = document.getElementById("resume-preview");
  const themeRoot = document.getElementById("theme-selection");
  const store = Store.getInstance();
  let initialModel = store.getState("formModel");

  if (!initialModel) {
    initialModel = new FormModelBuilder().getModel();
    store.setState("formModel", initialModel);
  }

  if (formRoot) {
    const form = new Form(formRoot, initialModel as Partial<FormModel>);
    form.build();
  }

  if (resumePreview) {
    const themeManager = ThemeManager.getInstance();
    themeManager.setPreviewContainer(resumePreview as HTMLElement);
    themeManager.setTheme(modernThemeConfig);

    const preview = new Preview(resumePreview, initialModel as Partial<FormModel>);
    preview.build();
  }

  if (themeRoot) {
    console.log("Theme selector would initialize here.");
  }

  console.log("Initial Store State:", store.getFullState());
});
