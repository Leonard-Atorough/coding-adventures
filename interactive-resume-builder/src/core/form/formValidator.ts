import type {FormModel} from "../../types/index";

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
  notifications: Array<{ field: string; message: string }>;
}

export default class FormValidator {
  validate(model: FormModel): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];
    // const warnings: Array<{ field: string; message: string }> = [];
    const notifications: Array<{ field: string; message: string }> = [];
    // Personal Info validation
    this.validatePersonalInfo(model, errors, notifications);

    // Education validation
    if (model.education.length === 0) {
      errors.push({ field: "education", message: "At least one education entry is required" });
    }
    model.education.forEach((edu, index) => {
      if (!edu.institution) {
        errors.push({
          field: `education-${index}-institution`,
          message: "Institution is required",
        });
      }
      if (!edu.degree) {
        errors.push({ field: `education-${index}-degree`, message: "Degree is required" });
      }
    });

    // Work Experience validation
    if (model.workExperience.length === 0) {
      errors.push({
        field: "workExperience",
        message: "At least one work experience entry is required",
      });
    }
    model.workExperience.forEach((work, index) => {
      if (!work.company) {
        errors.push({
          field: `workExperience-${index}-company`,
          message: "Company is required",
        });
      }
      if (!work.role) {
        errors.push({
          field: `workExperience-${index}-role`,
          message: "Role is required",
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      notifications,
    };
  }

  private validatePersonalInfo(
    model: FormModel,
    errors: { field: string; message: string }[],
    notifications: { field: string; message: string }[]
  ) {
    if (!this.isValidUsername(model.personalInfo.fullName)) {
      errors.push({ field: "personalInfo-fullName", message: "Full Name is required" });
    } else {
      notifications.push({ field: "personalInfo-fullName", message: "Looks good!" });
    }

    if (!this.isValidEmail(model.personalInfo.email)) {
      errors.push({ field: "personalInfo-email", message: "Email is required" });
    } else {
      notifications.push({ field: "personalInfo-email", message: "Looks good!" });
    }
    if (!this.isValidPhone(model.personalInfo.phone)) {
      errors.push({ field: "personalInfo-phone", message: "Phone is required" });
    } else {
      notifications.push({ field: "personalInfo-phone", message: "Looks good!" });
    }
    if (!this.isValidAddress(model.personalInfo.address)) {
      errors.push({ field: "personalInfo-address", message: "Address is required" });
    } else {
      notifications.push({ field: "personalInfo-address", message: "Looks good!" });
    }
  }

  private isValidUsername(username: string): boolean {
    const userNameElements = username.split(" ").filter((el) => el.trim() !== "");
    return (
      userNameElements.length >= 2 &&
      userNameElements.every((el) => el.length >= 2 && el.length <= 50)
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[0-9\s\-()]{4,17}$/;
    return phoneRegex.test(phone);
  }

  private isValidAddress(address: string): boolean {
    // Split address by commas and check each part
    const addressParts = address.split(",").map((part) => part.trim());
    return addressParts.every((part) => part.length >= 3 && part.length <= 100);
  }
}
