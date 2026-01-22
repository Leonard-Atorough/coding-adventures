import { Page, expect } from "@playwright/test";
import selectors from "../selectors";

export default class ResumeBuilderPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto("/");
    await this.waitForPageLoad();
  }

  private async waitForPageLoad() {
    await this.page.waitForLoadState("domcontentloaded");
  }

  async fillPersonalInfo(data: { name: string; email: string; phone?: string; address?: string }) {
    await this.page.getByLabel(selectors.personalInfo.inputName).fill(data.name);
    await this.page.getByLabel(selectors.personalInfo.inputEmail).fill(data.email);
    if (data.phone) await this.page.getByLabel(selectors.personalInfo.inputPhone).fill(data.phone);
    if (data.address)
      await this.page.getByLabel(selectors.personalInfo.inputAddress).fill(data.address);
  }

  async addEducation(data: {
    institution: string;
    degree: string;
    startDate?: string;
    endDate?: string;
  }) {
    await this.page.locator(selectors.education.addEducationButton).click();
    await this.page
      .getByLabel(selectors.education.educationInstitutionInput)
      .last()
      .fill(data.institution);
    await this.page.getByLabel(selectors.education.educationDegreeInput).last().fill(data.degree);
    if (data.startDate)
      await this.page
        .getByLabel(selectors.education.educationStartDateInput)
        .last()
        .fill(data.startDate);
    if (data.endDate)
      await this.page
        .getByLabel(selectors.education.educationEndDateInput)
        .last()
        .fill(data.endDate);
  }

  async addWorkExperience(data: {
    company: string;
    role: string;
    startDate?: string;
    endDate?: string;
    responsibilities?: string;
  }) {
    await this.page.locator(selectors.workExperience.addWorkExperienceButton).click();
    await this.page.getByLabel(selectors.workExperience.workCompanyInput).last().fill(data.company);
    await this.page.getByLabel(selectors.workExperience.workPositionInput).last().fill(data.role);
    if (data.startDate)
      await this.page
        .getByLabel(selectors.workExperience.workStartDateInput)
        .last()
        .fill(data.startDate);
    if (data.endDate)
      await this.page
        .getByLabel(selectors.workExperience.workEndDateInput)
        .last()
        .fill(data.endDate);
    if (data.responsibilities)
      await this.page
        .getByLabel(selectors.workExperience.workDescriptionInput)
        .last()
        .fill(data.responsibilities);
  }

  async addSkill(data: { title: string; description?: string }) {
    await this.page.locator(selectors.skills.addSkillButton).click();
    await this.page.getByLabel(selectors.skills.skillNameInput).last().fill(data.title);
    if (data.description)
      await this.page.getByLabel(selectors.skills.skillLevelInput).last().fill(data.description);
  }

  async verifyPersonalInfoInPreview(name: string, email: string) {
    await expect(this.page.locator(selectors.resumePreview.resumeName)).toContainText(name);
    await expect(this.page.locator(selectors.resumePreview.resumeEmail)).toContainText(email);
  }

  async verifyEducationInPreview(institution: string) {
    await expect(this.page.locator(selectors.resumePreview.resumeEducation)).toContainText(
      institution,
    );
  }

  async takeResumeScreenshot(name: string): Promise<string> {
    const preview = this.page.locator(selectors.resumePreview.resumePreview);
    await preview.screenshot({ path: `test-results/screenshots/${name}.png` });
    return `test-results/screenshots/${name}.png`;
  }

  async compareResumeVisual(name: string) {
    const preview = this.page.locator(selectors.resumePreview.resumePreview);
    await expect(preview).toHaveScreenshot(`${name}.png`);
  }
}
