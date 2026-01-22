import type { FormModel, educationItem, workExperienceItem, skillItem } from "../../types";

class EmptyFormModel implements FormModel {
  personalInfo = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
  };
  education = [
    {
      id: null,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    } as educationItem,
  ];
  workExperience = [
    {
      id: null,
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      responsibilities: "",
    } as workExperienceItem,
  ];
  skills = [
    {
      id: null,
      title: "",
      description: "",
    } as skillItem,
  ];
  additionalInformation = {
    certifications: [],
    languages: [],
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
