import { Browser, chromium } from "playwright";

export default class RootScraper {
  protected browser?: Browser;

  async initialise() {
    this.browser = await chromium.launch({ headless: false });

    return this.browser;
  }
}
