import type { ThemeConfig } from "../../types";
import { modernThemeConfig } from "../theme/themes/modern";
import { classicThemeConfig } from "../theme/themes/classic";
import { minimalThemeConfig } from "../theme/themes/minimal";

export default class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeConfig | null = null;
  private themeRegistry: Map<string, ThemeConfig> = new Map();
  private previewContainer: HTMLElement | null = null;

  private constructor() {
    this.themeRegistry.set(modernThemeConfig.name, modernThemeConfig);
    this.themeRegistry.set(classicThemeConfig.name, classicThemeConfig);
    this.themeRegistry.set(minimalThemeConfig.name, minimalThemeConfig);
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Set the preview container where themes will be applied
   */
  public setPreviewContainer(container: HTMLElement): void {
    this.previewContainer = container;
    // Reapply current theme if one is set
    if (this.currentTheme) {
      this.applyThemeToContainer(this.previewContainer, this.currentTheme);
    }
  }

  public setTheme(theme: ThemeConfig): void {
    try {
      this.currentTheme = theme;
      
      if (!this.previewContainer) {
        console.warn("Preview container not set. Call setPreviewContainer() first.");
        return;
      }

      this.applyThemeToContainer(this.previewContainer, theme);
    } catch (error) {
      console.error("Error setting theme:", error);
    }
  }

  /**
   * Apply theme to a specific container element
   */
  private applyThemeToContainer(container: HTMLElement, theme: ThemeConfig): void {
    this.setThemeColors(container, theme);
    this.setThemeTypography(container, theme);
    this.setThemeSpacing(container, theme);
    this.setThemeBorderRadius(container, theme);
    this.setThemeShadows(container, theme);
  }

  public getTheme(): ThemeConfig | null {
    return this.currentTheme;
  }

  public getAvailableThemes(): ThemeConfig[] {
    return Array.from(this.themeRegistry.values());
  }

  public registerTheme(theme: ThemeConfig): void {
    this.themeRegistry.set(theme.name, theme);
  }

  private setThemeColors(root: HTMLElement, theme: ThemeConfig) {
    const colors = theme.colors;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }

  private setThemeTypography(root: HTMLElement, theme: ThemeConfig) {
    const typography = theme.typography;
    Object.entries(typography).forEach(([key, value]) => {
      if (typeof value === "object") {
        switch (key) {
          case "fontSize":
            Object.entries(value).forEach(([sizeKey, sizeValue]) => {
              root.style.setProperty(`--font-size-${sizeKey}`, sizeValue);
            });
            break;
          case "fontWeight":
            Object.entries(value).forEach(([weightKey, weightValue]) => {
              root.style.setProperty(`--font-weight-${weightKey}`, weightValue.toString());
            });
            break;
          default:
            break;
        }
      } else if (typeof value === "string") {
        switch (key) {
          case "fontFamily":
            root.style.setProperty(`--font-family`, value);
            break;
          case "headingFamily":
            root.style.setProperty(`--heading-family`, value);
            break;
          default:
            break;
        }
      }
    });
  }

  private setThemeSpacing(root: HTMLElement, theme: ThemeConfig) {
    const spacing = theme.spacing;
    Object.entries(spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
  }

  private setThemeBorderRadius(root: HTMLElement, theme: ThemeConfig) {
    const borderRadius = theme.borderRadius;
    Object.entries(borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });
  }

  private setThemeShadows(root: HTMLElement, theme: ThemeConfig) {
    const shadows = theme.shadows;
    Object.entries(shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  }
}
