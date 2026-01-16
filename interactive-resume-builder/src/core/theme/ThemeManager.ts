import type { ThemeConfig } from "../../types";
import { modernThemeConfig } from "../theme/themes/modern";
import { classicThemeConfig } from "../theme/themes/classic";
import { minimalThemeConfig } from "../theme/themes/minimal";

export default class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeConfig | null = null;
  private themeRegistry: Map<string, ThemeConfig> = new Map();

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

  public setTheme(theme: ThemeConfig): void {
    try {
      this.currentTheme = theme;
      const root = document.documentElement;
      this.setThemeColors(root);
    } catch (error) {
      console.error("Error setting theme:", error);
    }
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

  private setThemeColors(root: HTMLElement) {
    if (!this.currentTheme) return;

    const colors = this.currentTheme.colors;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }
}
