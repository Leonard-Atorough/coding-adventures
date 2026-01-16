import type { ThemeConfig } from "../../../types";

export const minimalThemeConfig: ThemeConfig = {
  name: "Minimal",
  colors: {
    primary: "#000000",
    secondary: "#6b6b6b",
    accent: "#333333",
    background: "#ffffff",
    surface: "#fafafa",
    text: "#000000",
    textSecondary: "#6b6b6b",
    border: "#e0e0e0",
  },
  typography: {
    fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
    headingFamily: "'Helvetica Neue', 'Arial', sans-serif",
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
    sm: "0.125rem",
    md: "0.25rem",
    lg: "0.375rem",
    xl: "0.5rem",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
    md: "0 2px 4px 0 rgba(0, 0, 0, 0.05)",
    lg: "0 4px 8px 0 rgba(0, 0, 0, 0.08)",
  },
};
