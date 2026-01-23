import type { FormModel } from "../../types";

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
    this.renderHeaderSection(currentModel.personalInfo);
    this.renderSection(currentModel, "education", "education");
    this.renderSection(currentModel, "workExperience", "workExperience");
    this.renderSection(currentModel, "skills", "skillItem");
    this.renderAdditionalInformationSection(currentModel.additionalInformation);
    return this.root;
  }

  private renderHeaderSection(personalInfo: FormModel["personalInfo"]): void {
    const header = document.createElement("header");
    header.className = "preview-header";

    const nameEl = document.createElement("h1");
    nameEl.textContent = personalInfo?.fullName || "Your Name";
    header.appendChild(nameEl);

    const contactEl = document.createElement("p");
    const email = personalInfo?.email || "";
    const phone = personalInfo?.phone || "";
    const address = personalInfo?.address || "";
    contactEl.textContent = `Email: ${email} | Phone: ${phone} | Address: ${address}`;
    header.appendChild(contactEl);

    const summaryEl = document.createElement("div");
    summaryEl.className = "preview-summary";
    const summaryHeader = document.createElement("h2");
    summaryHeader.textContent = "Professional Summary";
    const summaryContent = document.createElement("p");
    summaryContent.textContent = personalInfo?.summary || "A brief summary about yourself.";
    summaryEl.appendChild(summaryHeader);
    summaryEl.appendChild(summaryContent);
    header.appendChild(summaryEl);

    this.root.appendChild(header);
  }

  private renderAdditionalInformationSection(
    additionalInformation: FormModel["additionalInformation"],
  ): void {
    const section = document.createElement("section");
    section.className = "preview-additional-information";
    const header = document.createElement("h2");
    header.textContent = "Additional Information";
    section.appendChild(header);

    // Well render certifications, languages, hobbies as a single line each, with commas separating items.
    // We have to anticipate both a space and comma separated input and parse accordingly.
    // We will render in the format: Certifications: cert1, cert2 <br> Languages: lang1, lang2 <br> Hobbies: hobby1, hobby2
    // This is a simple approach and can be enhanced later.
    const certs = additionalInformation.certifications?.join(", ") || "None";
    const langs = additionalInformation.languages?.join(", ") || "None";
    const hobbies = additionalInformation.hobbies?.join(", ") || "None";
    const infoEl = document.createElement("p");
    infoEl.innerHTML = `<strong>Certifications:</strong> ${certs} <br>
                        <strong>Languages:</strong> ${langs} <br>
                        <strong>Hobbies:</strong> ${hobbies}`;
    section.appendChild(infoEl);

    this.root.appendChild(section);
  }

  private renderSection<T>(
    model: FormModel,
    sectionKey: keyof FormModel,
    itemType: "education" | "workExperience" | "skillItem",
  ): void {
    const section = document.createElement("section");
    section.className = `preview-${sectionKey.toString().toLowerCase()}`;
    const header = document.createElement("h2");

    switch (sectionKey) {
      case "education":
        header.textContent = "Education";
        break;
      case "workExperience":
        header.textContent = "Work Experience";
        break;
      case "skills":
        header.textContent = "Skills";
        break;
      default:
        header.textContent = sectionKey.toString();
    }
    section.appendChild(header);
    (model[sectionKey] as Array<T>).forEach((item) => {
      this.renderItem(section, item, itemType);
    });
    this.root.appendChild(section);
  }

  private renderItem<T>(
    container: HTMLElement,
    item: T,
    itemType: "education" | "workExperience" | "skillItem",
  ): void {
    const itemDiv = document.createElement("div");
    itemDiv.className = `preview-${itemType}-item`;

    const titleEl = document.createElement("h3");
    if (itemType === "education") {
      titleEl.textContent = (item as any).institution || "Institution Name";
    } else if (itemType === "workExperience") {
      titleEl.textContent = (item as any).company || "Company Name";
    } else if (itemType === "skillItem") {
      titleEl.textContent = (item as any).title || "Skill Title";
    }
    itemDiv.appendChild(titleEl);

    const detailEl = document.createElement("p");
    if (itemType === "education") {
      detailEl.innerHTML = `<strong>${(item as any).degree || "Degree"} - ${(item as any).fieldOfStudy || "Field"}</strong> (${(item as any).startDate || "Start Date"} - ${(item as any).endDate || "End Date"})`;
    } else if (itemType === "workExperience") {
      detailEl.textContent = `${(item as any).role || "Role"} (${(item as any).startDate || "Start Date"} - ${(item as any).endDate || "End Date"})`;
    } else if (itemType === "skillItem") {
      detailEl.textContent = (item as any).description || "Skill Description";
    }
    itemDiv.appendChild(detailEl);

    if (itemType !== "skillItem") {
      const descriptionEl = document.createElement("p");
      if (itemType === "education") {
        descriptionEl.textContent = (item as any).description || "Description of your studies.";
      } else if (itemType === "workExperience") {
        descriptionEl.textContent =
          (item as any).responsibilities || "Description of your responsibilities.";
      }
      itemDiv.appendChild(descriptionEl);
    }

    container.appendChild(itemDiv);
  }
}
