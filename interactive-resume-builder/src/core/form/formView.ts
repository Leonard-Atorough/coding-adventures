import type { FormModel, SectionKey } from "../../types";
import { formConfig } from "./formConfig";

interface RenderContext {
  root: HTMLElement;
  sectionCache: Map<SectionKey, HTMLElement[]>;
  currentRowIndex: number;
}

export default class FormView {
  private readonly ctx: RenderContext;
  private readonly model: FormModel;
  private readonly sectionKeys: SectionKey[];

  constructor(mountPoint: string | HTMLElement, initialModel: Partial<FormModel> = {}) {
    const rootEl = typeof mountPoint === "string" ? document.querySelector(mountPoint) : mountPoint;
    if (!rootEl) throw new Error("Mount point not found");

    this.model = { ...initialModel } as FormModel;
    this.sectionKeys = Object.keys(formConfig) as SectionKey[];

    this.ctx = {
      root: rootEl as HTMLElement,
      // By using a Map to cache rendered sections, 
      // we can efficiently manage dynamic form sections and avoid recreating expensive DOM elements.
      sectionCache: new Map(),
      currentRowIndex: 0,
    };

    this.initializeSectionCache();
  }

  private initializeSectionCache(): void {
    Object.keys(this.model).forEach((section) => {
      this.ctx.sectionCache.set(section as SectionKey, []);
    });
  }

  private getForm(): HTMLFormElement {
    return this.ctx.root.querySelector("#resume-form") as HTMLFormElement;
  }

  render(): HTMLFormElement {
    const form = this.getForm() || this.createForm();
    form.innerHTML = "";

    const currentSection = this.sectionKeys[this.ctx.currentRowIndex];

    if (this.ctx.sectionCache.has(currentSection)) {
      // Re-render existing section from cache
      this.ctx.sectionCache.get(currentSection)?.forEach((section) => {
        form.appendChild(section);
      });
    } else {
      this.renderFormSection(currentSection);
    }
    this.ctx.currentRowIndex = this.sectionKeys.indexOf(currentSection);
    return form;
  }

  private createForm(): HTMLFormElement {
    const form = document.createElement("form");
    form.id = "resume-form";
    form.className = "resume-form";
    this.ctx.root.appendChild(form);
    return form;
  }

  private renderFormSection(section: SectionKey): void {
    const form = this.getForm();
    const sectionDiv = this.createSectionContainer(section);

    const formGroups = this.createFormGroups(section);
    sectionDiv.appendChild(formGroups);

    if (formConfig[section].isArray) {
      sectionDiv.appendChild(this.createAddButton(section));
    }

    sectionDiv.appendChild(this.createNavigationButtons());

    form.appendChild(sectionDiv);
    this.ctx.sectionCache.set(section, [sectionDiv]);
  }

  private createSectionContainer(section: SectionKey): HTMLDivElement {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "form-section";
    sectionDiv.id = `section-${section}`;

    const title = document.createElement("h2");
    title.textContent = formConfig[section].displayName;
    title.className = "form-section__title";
    sectionDiv.appendChild(title);

    return sectionDiv;
  }

  private createFormGroups(section: SectionKey): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "form-groups";

    const config = formConfig[section];
    const isArray = config.isArray && Array.isArray(this.model[section]);
    const modelArray = isArray ? (this.model[section] as Array<any>) : [];

    if (isArray && modelArray.length > 0) {
      modelArray.forEach((_, index) => {
        config.fields.forEach((field) => {
          container.append(this.createFormGroup(section, field, index));
        });
      });
    } else {
      config.fields.forEach((field) => {
        container.append(this.createFormGroup(section, field));
      });
    }

    return container;
  }

  private createAddButton(section: SectionKey): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `Add ${formConfig[section].displayName}`;
    button.className = "form-section__add-button";
    return button;
  }

  private createNavigationButtons(): HTMLDivElement {
    const nav = document.createElement("div");
    nav.className = "form-section__navigation";

    const prevButton = this.createNavButton("Previous Section", "prev", -1);
    const nextButton = this.createNavButton("Next Section", "next", 1);

    nav.appendChild(prevButton);
    nav.appendChild(nextButton);

    return nav;
  }

  private createNavButton(
    text: string,
    direction: "prev" | "next",
    offset: number,
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.className = `form-section__nav-button form-section__nav-button--${direction}`;

    const targetIndex = this.ctx.currentRowIndex + offset;
    button.disabled = targetIndex < 0 || targetIndex >= this.sectionKeys.length;

    if (!button.disabled) {
      button.addEventListener("click", () => {
        this.ctx.currentRowIndex = targetIndex;
        this.render();
      });
    }

    return button;
  }

  private createFormGroup(
    section: SectionKey,
    field: { key: string; label: string; type: string },
    index?: number,
  ): HTMLElement {
    const formGroup = document.createElement("div");
    formGroup.className = "form-group";

    const fieldId = this.generateFieldId(section, field.key, index);

    const label = this.createLabel(fieldId, field.label);
    const input = this.createInput(fieldId, field);
    const alertBox = this.createAlertBox(fieldId);

    if (field.type === "textarea") {
      formGroup.classList.add("form-group--full-width");
    }

    formGroup.appendChild(label);
    formGroup.appendChild(input);
    formGroup.appendChild(alertBox);

    return formGroup;
  }

  private generateFieldId(section: SectionKey, key: string, index?: number): string {
    return `${section}-${key}${index !== undefined ? `-${index}` : ""}`;
  }

  private createLabel(fieldId: string, text: string): HTMLLabelElement {
    const label = document.createElement("label");
    label.htmlFor = fieldId;
    label.textContent = text;
    label.className = "form-group__label";
    return label;
  }

  private createInput(
    fieldId: string,
    field: { type: string },
  ): HTMLInputElement | HTMLTextAreaElement {
    let input: HTMLInputElement | HTMLTextAreaElement;

    if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 8;
      input.className = "form-group__textarea";
    } else {
      input = document.createElement("input");
      input.type = field.type;
      input.className = "form-group__input";
    }

    input.id = fieldId;
    input.setAttribute("name", fieldId);

    return input;
  }

  private createAlertBox(fieldId: string): HTMLDivElement {
    const alertBox = document.createElement("div");
    alertBox.className = "form-group__alert";
    alertBox.style.opacity = "0";
    alertBox.id = `${fieldId}-error`;
    return alertBox;
  }

  renderValidationMessage(fieldId: string, message: string, type: string): void {
    const alertBox = this.ctx.root.querySelector(`#${fieldId}-error`) as HTMLDivElement;
    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.style.opacity = "1";
    alertBox.className = `form-group__alert ${type}`;
  }

  clear(): void {
    const form = this.getForm();
    if (!form) return;

    form.reset();
    this.ctx.sectionCache.forEach((section) => {
      section.forEach((row, index) => {
        if (index > 0) row.remove();
      });
    });
    this.ctx.sectionCache.clear();
    this.initializeSectionCache();
  }
}
