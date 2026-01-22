import type { FormModel, SectionKey } from "../../types";
import { formConfig } from "./FormConfig";



// Context for rendering the form
// Holds references to the root element and current state of the form visually. Local state that doesn't affect the model or get persisted.
interface RenderContext {
  root: HTMLElement;
  rowsMap: Map<SectionKey, HTMLElement[]>;
  currentRowIndex?: number;
}

export default class FormView {
  private readonly ctx: RenderContext;
  private readonly model: FormModel;

  constructor(mountPoint: string | HTMLElement, initialModel: Partial<FormModel> = {}) {
    const rootEl = typeof mountPoint === "string" ? document.querySelector(mountPoint) : mountPoint;

    if (!rootEl) throw new Error("Mount point not found");

    this.model = { ...initialModel } as FormModel;

    this.ctx = {
      root: rootEl as HTMLElement,
      rowsMap: new Map(),
      currentRowIndex: 0,
    };

    Object.entries(this.model).forEach(([section, data]) => {
      this.ctx.rowsMap.set(section as SectionKey, []);
    });
  }

  private getForm(): HTMLFormElement {
    return this.ctx.root.querySelector("#resume-form") as HTMLFormElement;
  }

  render(): HTMLFormElement {
    const form = this.getForm() || document.createElement("form");
    form.id = "resume-form";
    form.className = "resume-form";
    form.innerHTML = "";
    this.ctx.root.appendChild(form);

    const nextSectionKeys = Object.keys(formConfig) as SectionKey[];

    this.renderFormSection(nextSectionKeys[this.ctx.currentRowIndex ?? 0]);
    return form;
  }

  private renderFormSection(section: SectionKey): void {
    const form = this.getForm();

    const sectionDiv = document.createElement("div");
    sectionDiv.className = "form-section";
    sectionDiv.id = `section-${section}`;

    const sectionTitle = document.createElement("h2");
    sectionTitle.textContent = formConfig[section].displayName;
    sectionTitle.className = "form-section__title";
    sectionDiv.appendChild(sectionTitle);

    const formGroups = document.createElement("div");
    formGroups.className = "form-groups";
    sectionDiv.appendChild(formGroups);

    if (
      formConfig[section].isArray &&
      Array.isArray(this.model[section]) &&
      this.model[section].length > 0
    ) {
      this.model[section].forEach((_, index) => {
        formConfig[section].fields.forEach((field) => {
          formGroups.append(this.renderFormGroup(section, field, index));
        });
      });
    } else {
      formConfig[section].fields.forEach((field) => {
        formGroups.append(this.renderFormGroup(section, field));
      });
    }

    if (formConfig[section].isArray) {
      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.textContent = `Add ${formConfig[section].displayName}`;
      addButton.className = "form-section__add-button";
      sectionDiv.appendChild(addButton);
    }

    const navigationDiv = document.createElement("div");
    navigationDiv.className = "form-section__navigation";
    sectionDiv.appendChild(navigationDiv);
    this.initializeNavigationButtons(navigationDiv);

    form.appendChild(sectionDiv);
    this.ctx.rowsMap.set(section, [sectionDiv]);
  }

  private initializeNavigationButtons(navigationDiv: HTMLDivElement) {
    const nextIndex = (this.ctx.currentRowIndex ?? 0) + 1;
    const prevIndex = (this.ctx.currentRowIndex ?? 0) - 1;

    const nextSectionKeys = Object.keys(formConfig) as SectionKey[];

    const prevSectionButton = document.createElement("button");
    prevSectionButton.type = "button";
    prevSectionButton.textContent = "Previous Section";
    prevSectionButton.className = " form-section__nav-button form-section__nav-button--prev";
    prevSectionButton.addEventListener("click", () => {
      if (this.ctx.currentRowIndex === undefined) return;
      this.ctx.currentRowIndex = prevIndex;
      this.render();
    });
    if (prevIndex < 0) {
      prevSectionButton.disabled = true;
    }
    navigationDiv.appendChild(prevSectionButton);

    const nextSectionButton = document.createElement("button");
    nextSectionButton.type = "button";
    nextSectionButton.textContent = "Next Section";
    nextSectionButton.className = "form-section__nav-button form-section__nav-button--next";

    nextSectionButton.addEventListener("click", () => {
      if (this.ctx.currentRowIndex === undefined) return;
      this.ctx.currentRowIndex = nextIndex;
      this.render();
    });
    navigationDiv.appendChild(nextSectionButton);
    if (nextIndex >= nextSectionKeys.length) {
      nextSectionButton.disabled = true;
    }
  }

  private renderFormGroup(
    section: SectionKey,
    field: { key: string; label: string; type: string },
    index?: number
  ): HTMLElement {
    const formGroup = document.createElement("div");
    formGroup.className = "form-group";

    const label = document.createElement("label");
    label.htmlFor = `${section}-${field.key}${index !== undefined ? `-${index}` : ""}`;
    label.textContent = field.label;
    label.className = "form-group__label";

    const alertBox = document.createElement("div");
    alertBox.className = "form-group__alert";
    alertBox.style.opacity = "0";
    alertBox.id = `${section}-${field.key}${index !== undefined ? `-${index}` : ""}-error`;

    let input: HTMLElement;
    if (field.type === "textarea") {
      input = document.createElement("textarea");
      (input as HTMLTextAreaElement).rows = 8;
      input.className = "form-group__textarea";
      formGroup.classList.add("form-group--full-width");
    } else {
      input = document.createElement("input");
      (input as HTMLInputElement).type = field.type;
      input.className = "form-group__input";
    }

    input.id = `${section}-${field.key}${index !== undefined ? `-${index}` : ""}`;
    input.setAttribute("name", `${section}-${field.key}${index !== undefined ? `-${index}` : ""}`);

    formGroup.appendChild(label);
    formGroup.appendChild(input);
    formGroup.appendChild(alertBox);

    return formGroup;
  }

  RenderValidationMessage(fieldId: string, message: string, type: string): void {
    const alertBox = this.ctx.root.querySelector(`#${fieldId}-error`) as HTMLDivElement;

    if (alertBox) {
      alertBox.textContent = message;
      alertBox.style.opacity = "1";
      alertBox.className = `form-group__alert ${type}`;
    }
  }

  clear(): void {
    const form = this.getForm();
    if (!form) return;
    form.reset();

    this.ctx.rowsMap.forEach((rows, section) => {
      rows.forEach((row, index) => {
        if (index > 0) {
          row.remove();
        }
      });
      this.ctx.rowsMap.set(section, []);
    });
  }
}
