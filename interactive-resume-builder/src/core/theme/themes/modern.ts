import type { ThemeConfig } from "../../../types";

// Example theme implementation
export const modernThemeConfig: ThemeConfig = {
  name: "Modern",
  colors: {
    primary: "#2563eb",
    secondary: "#64748b",
    accent: "#0ea5e9",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1e293b",
    textSecondary: "#64748b",
    border: "#e2e8f0",
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    headingFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
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
