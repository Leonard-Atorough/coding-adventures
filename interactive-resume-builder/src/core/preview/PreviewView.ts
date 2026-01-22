import type { FormModel } from "../../types/index";

export default class PreviewView {
  private readonly root: HTMLElement;
  private readonly model: FormModel;

  constructor(mountPoint: string | HTMLElement, model: Partial<FormModel> = {}) {
    const rootEl = typeof mountPoint === "string" ? document.querySelector(mountPoint) : mountPoint;
    if (!rootEl) throw new Error("Mount point not found");
    this.root = rootEl as HTMLElement;

    this.model = { ...model } as FormModel;
  }

  render(): HTMLElement {
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
    this.renderHeaderSection();
    // this.renderEducationSection();
    // this.renderWorkExperienceSection();
    // this.renderSkillsSection();
    // this.renderAdditionalInformationSection();
    return this.root;
  }

  private renderHeaderSection(): void {
    const header = document.createElement("header");
    header.className = "preview-header";

    const nameEl = document.createElement("h1");
    nameEl.textContent = this.model.personalInfo?.fullName || "Your Name";
    header.appendChild(nameEl);

    const contactEl = document.createElement("p");
    const email = this.model.personalInfo?.email || "";
    const phone = this.model.personalInfo?.phone || "";
    const address = this.model.personalInfo?.address || "";
    contactEl.textContent = `Email: ${email} | Phone: ${phone} | Address: ${address}`;
    header.appendChild(contactEl);

    const summaryEl = document.createElement("div");
    summaryEl.className = "preview-summary";
    const summaryHeader = document.createElement("h2");
    summaryHeader.textContent = "Professional Summary";
    const summaryContent = document.createElement("p");
    summaryContent.textContent =
      this.model.personalInfo?.summary || "A brief summary about yourself.";
    summaryEl.appendChild(summaryHeader);
    summaryEl.appendChild(summaryContent);
    header.appendChild(summaryEl);

    this.root.appendChild(header);
  }
}
