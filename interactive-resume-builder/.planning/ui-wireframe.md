# UI Design

This document outlines the UI wireframe for the Interactive Resume Builder application. The goal is to create a user-friendly interface that allows users to easily input their information and generate a professional resume.

## Wireframe Overview

The wireframe consists of the following main components:

1. **Header**
   - Title: "Interactive Resume Builder"
   - Subtitle: "Create your professional resume in minutes"
2. **Form Section**
   - Input fields for:
     - Personal Information (Name, Email, Phone, Address)
     - Education (School, Degree, Graduation Year)
     - Work Experience (Company, Role, Duration, Responsibilities)
     - Skills (List of skills)
     - Additional Information (Certifications, Languages, Hobbies)
   - Each section will have clear labels and input fields.
3. **Theme Selection**
   - A dropdown or radio buttons to select from 2-3 different resume themes/styles.
   - Preview thumbnails of each theme for better visualization.
4. **Generate Button**
   - A prominent button labeled "Generate PDF" to create the resume.
5. **Footer**
   - Links to "About", "Contact", and "Privacy Policy"

## Layout

- The layout will be a single-page design with a vertical scroll.
- The header will be fixed at the top for easy access.
- The form section will be divided into collapsible panels for each information category to keep the interface organized.
- The theme selection will be placed below the form section.
- The generate button will be centered at the bottom of the form section for easy access.


# UI Design — Updated

Top-level layout updated to a two-column builder: left is the form/sidebar, right is the live resume preview (themed and printable).

## Key Areas

- Header: app title and quick actions (Export, Reset).
- Left Sidebar: form groups (collapsible) and theme controls.
- Right Preview: `#resume-preview` container renders the CV and receives theme CSS variables.
- Footer: subtle links and attribution.

## Sidebar (form + controls)

- Collapsible panels: Personal, Education, Work, Skills, Extras.
- Per-field validation feedback shown inline.
- Theme selector: visual thumbnails + radio list; selecting updates preview only.
- Generate PDF button and small export options (PDF, PNG).

## Preview

- Represents a physical page (8.5"×11") centered in the preview area.
- Uses CSS variables for colors, typography, spacing; themes only set variables on the preview container.
- Live updates from form via `modelUpdate` events.

## Responsive behavior

- Desktop: two-column grid (.builder-sidebar / .preview-container).
- Tablet/mobile: stacked layout with preview below or toggled via a "Preview" button.

## Accessibility & Interaction notes

- Keyboard focus states, aria labels for collapsible groups, and semantic headings.
- Validation is debounced and shown per-field; success messages are presented in UI only, not as validation return values.

## ASCII Overview
```

+-----------------------------------------------+
| Header (Title) |
+-----------------------------------------------+
| Sidebar (Form) | Preview |
| | +-----------------------+ |
| [Collapsible] | | Resume Preview Box | |
| [Theme thumb] | | (themed, printable) | |
| [Generate] | +-----------------------+ |
+-----------------------------------------------+
| Footer |
+-----------------------------------------------+

```
