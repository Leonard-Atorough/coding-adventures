import type { FormModel } from "../../types";
import PreviewView from "./PreviewView";

export default class Preview {
  private view: PreviewView;
  private model: FormModel;
  private previewElement: HTMLElement | null = null;
  private modelUpdateHandler: ((e: Event) => void) | null = null;

  constructor(mountPoint: string | HTMLElement, model: Partial<FormModel> = {}) {
    this.view = new PreviewView(mountPoint, model);
    this.model = { ...model } as FormModel;
    this.modelUpdateHandler = (e: Event) => {
      const customEvent = e as CustomEvent<Partial<FormModel>>;
      this.onModelUpdate(customEvent.detail);
    };
    console.log("Preview initialized with model:", this.model);
  }

  build(): void {
    this.clear();
    this.previewElement = this.view.render();
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

    // Just re-render the view, don't rebuild (which would add more listeners)
    this.view = new PreviewView(this.previewElement as HTMLElement, this.model);
    this.previewElement = this.view.render();
  }
}
