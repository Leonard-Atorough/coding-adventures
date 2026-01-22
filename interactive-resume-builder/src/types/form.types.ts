export interface personalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
}

export interface educationItem {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface workExperienceItem {
  id: number;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export interface skillItem {
  id: number;
  title: string;
  description: string;
}

export interface additionalInformation {
  certifications: Array<{
    id: number;
    description: string;
  }>;
  langauges: Array<{
    id: number;
    description: string;
  }>;
  hobbies: Array<{
    id: number;
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