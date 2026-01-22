import type { FormModel } from "../../types/index";

class EmptyFormModel implements FormModel {
  personalInfo = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
  };
  education = Array.from<FormModel["education"][0]>({ length: 0 });
  workExperience = Array.from<FormModel["workExperience"][0]>({ length: 0 });
  skills = Array.from<FormModel["skills"][0]>({ length: 0 });
  additionalInformation = {
    certifications: [],
    langauges: [],
    hobbies: [],
  };
}

export default class FormModelBuilder {
  private model: FormModel;

  constructor(FormModelInput?: Partial<FormModel>) {
    this.model = { ...new EmptyFormModel(), ...FormModelInput } as FormModel;
  }

  getModel(): FormModel {
    return this.model;
  }

  setModel(model: FormModel): void {
    this.model = model;
  }

  updateModel(partialModel: Partial<FormModel>): void {
    this.model = { ...this.model, ...partialModel };
  }

  resetModel(): void {
    this.model = new EmptyFormModel();
  }
}
