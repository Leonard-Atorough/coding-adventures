import type { FormModel } from "../../types/index";

export const formConfig: Record<
  keyof FormModel,
  {
    isArray: boolean;
    displayName: string;
    fields: Array<{ key: string; label: string; type: string }>;
  }
> = {
  personalInfo: {
    isArray: false,
    displayName: "Personal Information",
    fields: [
      { key: "fullName", label: "Full Name", type: "text" },
      { key: "email", label: "Email", type: "email" },
      { key: "phone", label: "Phone", type: "tel" },
      { key: "address", label: "Address", type: "text" },
      { key: "summary", label: "Summary", type: "textarea" },
    ],
  },
  education: {
    isArray: true,
    displayName: "Education",
    fields: [
      { key: "institution", label: "Institution", type: "text" },
      { key: "degree", label: "Degree", type: "text" },
      { key: "fieldOfStudy", label: "Field of Study", type: "text" },
      { key: "startDate", label: "Start Date", type: "date" },
      { key: "endDate", label: "End Date", type: "date" },
      { key: "description", label: "Description", type: "textarea" },
    ],
  },
  workExperience: {
    isArray: true,
    displayName: "Work Experience",
    fields: [
      { key: "company", label: "Company", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "startDate", label: "Start Date", type: "date" },
      { key: "endDate", label: "End Date", type: "date" },
      { key: "responsibilities", label: "Responsibilities", type: "textarea" },
    ],
  },
  skills: {
    isArray: true,
    displayName: "Skills",
    fields: [
      { key: "title", label: "Skill Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
    ],
  },
  additionalInformation: {
    isArray: false,
    displayName: "Additional Information",
    fields: [
      { key: "certifications", label: "Certifications", type: "textarea" },
      { key: "languages", label: "Languages", type: "textarea" },
      { key: "hobbies", label: "Hobbies", type: "textarea" },
    ],
  },
};
