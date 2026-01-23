import type { SectionKey } from "../../types";

export default class FormElementFactory {
  static generateFieldId(section: SectionKey, key: string, index?: number): string {
    return `${section}-${key}${index !== undefined ? `-${index}` : ""}`;
  }

  static createLabel(fieldId: string, text: string): HTMLLabelElement {
    const label = document.createElement("label");
    label.htmlFor = fieldId;
    label.textContent = text;
    label.className = "form-group__label";
    return label;
  }

  static createInput(
    fieldId: string,
    field: { type: string }
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

  static createAlertBox(fieldId: string): HTMLDivElement {
    const alertBox = document.createElement("div");
    alertBox.className = "form-group__alert";
    alertBox.style.opacity = "0";
    alertBox.id = `${fieldId}-error`;
    return alertBox;
  }

  static createFormGroup(
    section: SectionKey,
    field: { key: string; label: string; type: string },
    index?: number
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

  static createButton(text: string, className: string, onClick?: () => void): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.className = className;
    
    if (onClick) {
      button.addEventListener("click", onClick);
    }
    
    return button;
  }
}
