import type { ThemeConfig } from "../../../types";

export const classicThemeConfig: ThemeConfig = {
  name: "Classic",
  colors: {
    primary: "#000000",
    secondary: "#555555",
    accent: "#ff9900",
    background: "#ffffff",
    surface: "#f0f0f0",
    text: "#000000",
    ["text-secondary"]: "#555555",
    border: "#cccccc",
  },
  typography: {
    fontFamily: "'Times New Roman', serif",
    headingFamily: "'Georgia', serif",
    fontSize: {
      small: "0.875rem",
      base: "1rem",
      large: "1.125rem",
      xlarge: "1.5rem",
      xxlarge: "2rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  },
};
