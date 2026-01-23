import type { ThemeConfig } from "../../types";

export default class ThemeView {
  private root: HTMLElement;
  private selectedTheme: ThemeConfig | null = null;
  private themes: ThemeConfig[] = [];
  private themeStylesheet: HTMLStyleElement | null = null;

  /*
  We will pass in the
   */
  constructor(mountPoint: string | HTMLElement, initialThemes: ThemeConfig[] = []) {
    const rootEl = typeof mountPoint === "string" ? document.querySelector(mountPoint) : mountPoint;
    if (!rootEl) throw new Error("Mount point not found");
    this.root = rootEl as HTMLElement;
    this.themes = initialThemes;
    this.selectedTheme = this.themes.length > 0 ? this.themes[0] : null;
    console.log("ThemeView initialized with themes:", this.themes);
    console.log("Initial selected theme:", this.selectedTheme);
    console.log("Mount point:", this.root);
    this.themeStylesheet = document.createElement("style");
    document.head.appendChild(this.themeStylesheet);
  }
}
