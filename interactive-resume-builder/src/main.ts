import Form from "./core/form/form";
import Store from "./store/store";

document.addEventListener("DOMContentLoaded", () => {
  const formRoot = document.getElementById("form-section");
  const themeRoot = document.getElementById("theme-section");
  const store = Store.getInstance();
  if (formRoot) {
    const form = new Form(formRoot, store.getState("formModel") || {});
    form.build();
  }
  if (themeRoot) {
    // Theme builder initialization can go here
    console.log("Theme builder would initialize here.");
  }
  console.log("Initial Store State:", store.getFullState());
});
