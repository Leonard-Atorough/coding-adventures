export interface personalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
}

export interface educationItem {
  id: number | null;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface workExperienceItem {
  id: number | null;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export interface skillItem {
  id: number | null;
  title: string;
  description: string;
}

export interface additionalInformation {
  certifications: Array<{
    id: number | null;
    description: string;
  }>;
  languages: Array<{
    id: number | null;
    description: string;
  }>;
  hobbies: Array<{
    id: number | null;
    description: string;
  }>;
}

export interface FormModel {
  personalInfo: personalInfo;
  education: Array<educationItem>;
  workExperience: Array<workExperienceItem>;
  skills: Array<skillItem>;
  additionalInformation: additionalInformation;
}

export type SectionKey = keyof FormModel;
