import type { FormModel, SectionKey } from "../../types";

export default class PreviewView {
  private readonly root: HTMLElement;

  constructor(mountPoint: string | HTMLElement) {
    const rootEl = typeof mountPoint === "string" ? document.querySelector(mountPoint) : mountPoint;
    if (!rootEl) throw new Error("Mount point not found");
    this.root = rootEl as HTMLElement;
  }

  render(model: Partial<FormModel>): HTMLElement {
    const currentModel = { ...model } as FormModel;
    /* Steps:
    1. Clear existing content in the root element.
    2. Render Header Section (Name, Contact Info).
    3. Render Education Section.
    4. Render Work Experience Section.
    5. Render Skills Section.
    6. Render Additional Information Section.
    7. Apply basic styling to ensure readability.
    8. Handle empty states gracefully (e.g., "No work experience added yet").
    9. Ensure responsiveness for different screen sizes.
    10. Optionally, add print styles for resume printing.
     */
    this.root.innerHTML = "";
    this.renderHeaderSection(currentModel);
    this.renderEducationSection(currentModel);
    // this.renderWorkExperienceSection();
    // this.renderSkillsSection();
    // this.renderAdditionalInformationSection();
    return this.root;
  }

  private renderHeaderSection(model: FormModel): void {
    const header = document.createElement("header");
    header.className = "preview-header";

    const nameEl = document.createElement("h1");
    nameEl.textContent = model.personalInfo?.fullName || "Your Name";
    header.appendChild(nameEl);

    const contactEl = document.createElement("p");
    const email = model.personalInfo?.email || "";
    const phone = model.personalInfo?.phone || "";
    const address = model.personalInfo?.address || "";
    contactEl.textContent = `Email: ${email} | Phone: ${phone} | Address: ${address}`;
    header.appendChild(contactEl);

    const summaryEl = document.createElement("div");
    summaryEl.className = "preview-summary";
    const summaryHeader = document.createElement("h2");
    summaryHeader.textContent = "Professional Summary";
    const summaryContent = document.createElement("p");
    summaryContent.textContent = model.personalInfo?.summary || "A brief summary about yourself.";
    summaryEl.appendChild(summaryHeader);
    summaryEl.appendChild(summaryContent);
    header.appendChild(summaryEl);

    this.root.appendChild(header);
  }

  private renderEducationSection(model: FormModel): void {
    const educationSection = document.createElement("section");
    educationSection.className = "preview-education";
    const header = document.createElement("h2");
    header.textContent = "Education";
    educationSection.appendChild(header);
    this.root.appendChild(educationSection);

    model.education.forEach((edu) => {
      this.renderEducationItem(educationSection, edu);
    });
  }

  private renderEducationItem(
    container: HTMLElement,
    edu: FormModel["education"][0],
  ): void {
    const eduDiv = document.createElement("div");
    eduDiv.className = "preview-education-item";

    const institutionEl = document.createElement("h3");
    institutionEl.textContent = edu.institution ?? "Institution Name";
    eduDiv.appendChild(institutionEl);

    const degreeEl = document.createElement("p");
    degreeEl.textContent = `${edu.degree || "Degree"} (${edu.startDate || "Start Date"} - ${edu.endDate || "End Date"})`;
    eduDiv.appendChild(degreeEl);

    const descriptionEl = document.createElement("p");
    descriptionEl.textContent = edu.description || "Description of your studies.";
    eduDiv.appendChild(descriptionEl);

    container.appendChild(eduDiv);

  }
}
