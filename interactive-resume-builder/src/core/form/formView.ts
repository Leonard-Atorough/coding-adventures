import type { FormModel, SectionKey } from "../../types";
import { formConfig } from "./formConfig";
import FormElementFactory from "./FormElementFactory";

interface RenderContext {
  root: HTMLElement;
  sectionCache: Map<SectionKey, HTMLElement[]>;
  currentRowIndex: number;
}

export default class FormView {
  private readonly ctx: RenderContext;
  private readonly model: FormModel;
  private readonly sectionKeys: SectionKey[];

  constructor(mountPoint: string | HTMLElement, model: FormModel) {
    const rootEl = typeof mountPoint === "string" ? document.querySelector(mountPoint) : mountPoint;
    if (!rootEl) throw new Error("Mount point not found");

    this.model = model;
    this.sectionKeys = Object.keys(formConfig) as SectionKey[];

    this.ctx = {
      root: rootEl as HTMLElement,
      sectionCache: new Map(),
      currentRowIndex: 0,
    };
  }

  private getForm(): HTMLFormElement {
    return this.ctx.root.querySelector("#resume-form") as HTMLFormElement;
  }

  render(): HTMLFormElement {
    const form = this.getForm() || this.createForm();
    form.innerHTML = "";

    const sectionSelector = this.createSectionSelector();
    form.appendChild(sectionSelector);

    const currentSection = this.sectionKeys[this.ctx.currentRowIndex];

    // For array sections, always re-render to handle dynamic entries
    const shouldUseCache =
      this.ctx.sectionCache.has(currentSection) && !formConfig[currentSection].isArray;

    if (shouldUseCache) {
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

    const config = formConfig[section];
    const isArray = config.isArray;

    if (isArray) {
      const modelArray = this.model[section] as Array<any>;
      const itemCount = Math.max(modelArray.length, 1);

      for (let index = 0; index < itemCount; index++) {
        const formGroups = this.createFormGroups(section, index);
        sectionDiv.appendChild(formGroups);
      }
    } else {
      const formGroups = this.createFormGroups(section);
      sectionDiv.appendChild(formGroups);
    }

    if (isArray) {
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

  private createSectionSelector(): HTMLSelectElement {
    const select = document.createElement("select");
    select.className = "form-section__selector";
    select.id = "form-section-selector";
    this.sectionKeys.forEach((sectionKey, index) => {
      const option = document.createElement("option");
      option.value = sectionKey;
      option.textContent = formConfig[sectionKey].displayName;
      if (index === this.ctx.currentRowIndex) {
        option.selected = true;
      }
      select.appendChild(option);
    });
    select.addEventListener("change", (e) => {
      const target = e.target as HTMLSelectElement;
      const selectedSection = target.value as SectionKey;
      this.ctx.currentRowIndex = this.sectionKeys.indexOf(selectedSection);
      this.render();
    });
    return select;
  }

  private createFormGroups(section: SectionKey, index?: number): HTMLDivElement {
    const formContainer = document.createElement("div");
    formContainer.className = "form-section__container";

    const formGroupCollection = document.createElement("div");
    formGroupCollection.className = "form-groups";

    if (index !== undefined) {
      const header = document.createElement("h3");
      header.className = "form-groups__header";
      header.textContent = `${formConfig[section].displayName} ${index + 1}`;
      formContainer.appendChild(header);
    }

    const config = formConfig[section];
    const data = index !== undefined ? (this.model[section] as Array<any>)[index] : this.model[section];

    config.fields.forEach((field) => {
      const dataField = data[field.key] as string | undefined;
      formGroupCollection.append(FormElementFactory.createFormGroup(section, field, index, dataField));
    });

    formContainer.appendChild(formGroupCollection);

    return formContainer;
  }

  private createAddButton(section: SectionKey): HTMLButtonElement {
    return FormElementFactory.createButton(
      `Add ${formConfig[section].displayName}`,
      "form-section__add-button",
      () => {
        // Create an empty object with all fields from the section's config
        const newItem = formConfig[section].fields.reduce(
          (obj, field) => {
            obj[field.key] = "";
            return obj;
          },
          {} as Record<string, string>,
        );

        (this.model[section] as Array<any>) = [...(this.model[section] as Array<any>), newItem];
        this.render();
        const modelUpdateEvent = new CustomEvent<Partial<FormModel>>("modelUpdate", {
          detail: { ...this.model },
        });
        document.dispatchEvent(modelUpdateEvent);
      },
    );
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
    const targetIndex = this.ctx.currentRowIndex + offset;
    const isDisabled = targetIndex < 0 || targetIndex >= this.sectionKeys.length;

    const button = FormElementFactory.createButton(
      text,
      `form-section__nav-button form-section__nav-button--${direction}`,
      isDisabled
        ? undefined
        : () => {
            this.ctx.currentRowIndex = targetIndex;
            this.render();
          },
    );

    button.disabled = isDisabled;
    return button;
  }

  renderValidationMessage(fieldId: string, message: string, type: string): void {
    const alertBox = document.getElementById(`${fieldId}-error`);
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
  }
}
