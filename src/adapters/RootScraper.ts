import { Browser, chromium } from "playwright";

export default class RootScraper {
  protected browser?: Browser;

  async initialise() {
    this.browser = await chromium.launch({ headless: true });
    return this.browser;
  }

  async createNewContext() {
    if (!this.browser) {
      throw new Error("Missing browser");
    }
    return this.browser.newContext();
  }
}
