import type { FormModel } from "../../types";
import PreviewView from "./PreviewView";

export default class Preview {
  private view: PreviewView;
  private model: FormModel;
  private previewElement: HTMLElement | null = null;
  private modelUpdateHandler: ((e: Event) => void) | null = null;

  constructor(mountPoint: string | HTMLElement, model: Partial<FormModel> = {}) {
    this.view = new PreviewView(mountPoint);
    this.model = { ...model } as FormModel;
    this.modelUpdateHandler = (e: Event) => {
      const customEvent = e as CustomEvent<Partial<FormModel>>;
      this.onModelUpdate(customEvent.detail);
    };
    console.log("Preview initialized with model:", this.model);
  }

  build(): void {
    this.previewElement = this.view.render(this.model);
    this.attachEventListeners();
  }

  clear(): void {
    if (this.previewElement) {
      this.previewElement.innerHTML = "";
    }
  }

  attachEventListeners(): void {
    if (!this.modelUpdateHandler) return;

    // Remove old listener to prevent duplicates
    document.removeEventListener("modelUpdate", this.modelUpdateHandler);
    document.addEventListener("modelUpdate", this.modelUpdateHandler);
  }

  private onModelUpdate(newModel: Partial<FormModel>): void {
    console.log("Preview received model update:", newModel);
    this.model = { ...this.model, ...newModel } as FormModel;
    console.log("Preview model updated:", this.model);
    
    this.view.render(this.model);
  }
}
