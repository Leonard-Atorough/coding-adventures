import type { FormModel } from "../../types/index";
import FormValidator, { type ValidationResult } from "./formValidator";
import FormView from "./formView";
import FormModelBuilder from "./formModelBuilder";

import { debounce } from "../../utils/debounce";

export default class Form implements Form {
  private readonly VALIDATION_ERROR_CLASS = "form-group__alert--error";
  private readonly VALIDATION_NOTIFICATION_CLASS = "form-group__alert--success";

  private readonly model: FormModel;
  private readonly validator: FormValidator;
  private readonly formView: FormView;
  private formElement: HTMLFormElement | null = null;

  private debouncedInputHandler: ((e: Event) => void) | null = null;

  constructor(mountPoint: string | HTMLElement, initialModel: Partial<FormModel> = {}) {
    const rootEl = typeof mountPoint === "string" ? document.querySelector(mountPoint) : mountPoint;
    if (!rootEl) throw new Error("Mount point not found");

    this.model = new FormModelBuilder(initialModel).getModel();
    this.validator = new FormValidator();
    this.formView = new FormView(mountPoint, initialModel);
    this.debouncedInputHandler = debounce((e: Event) => this.handleInputChange(e), 500);
    console.log("Form initialized with model:", this.model);
  }

  build(): void {
    this.clear();
    this.formElement = this.formView.render();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    if (!this.formElement || !this.debouncedInputHandler) return;

    // Remove old listener if it exists to prevent duplicates
    this.formElement.removeEventListener("input", this.debouncedInputHandler);
    this.formElement.addEventListener("input", this.debouncedInputHandler);
  }

  clear(): void {
    this.formView.clear();
  }

  private handleInputChange(e: Event): void {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const [section, field, index] = target.name.split("-");

    if (!section || !field) return;

    if (index !== undefined) {
      const idx = parseInt(index, 10);
      if (isNaN(idx)) return;
      // Update model for array items
      if (section in this.model && Array.isArray((this.model as any)[section])) {
        // @ts-ignore
        this.model[section][idx][field] = target.value;
      }
    } else {
      // Update model for non-array items
      if (section in this.model) {
        // @ts-ignore
        this.model[section][field] = target.value;
      }
    }
    const validationResult = this.validator.validate(this.model);
    console.log("Validation Result:", validationResult);
    console.log("Current Model:", this.model);
    this.displayValidationResults(validationResult);

    const modelUpdateEvent = new CustomEvent<Partial<FormModel>>("modelUpdate", {
      detail: { ...this.model },
    });
    document.dispatchEvent(modelUpdateEvent);
    console.log("Dispatched modelUpdate event with detail:", { ...this.model });
  }

  private displayValidationResults(validationResult: ValidationResult): void {
    const validationFields = this.formElement?.querySelectorAll(".form-group__alert");
    validationFields?.forEach((field) => {
      (field as HTMLDivElement).textContent = "";
      (field as HTMLDivElement).style.opacity = "0`";
    });
    validationResult.errors.forEach((error) => {
      this.formView.renderValidationMessage(
        error.field,
        error.message,
        this.VALIDATION_ERROR_CLASS
      );
    });
    validationResult.notifications.forEach((notification) => {
      this.formView.renderValidationMessage(
        notification.field,
        notification.message,
        this.VALIDATION_NOTIFICATION_CLASS
      );
    });
  }
}

export default interface Form {
  build(): void;
  clear(): void;
}
