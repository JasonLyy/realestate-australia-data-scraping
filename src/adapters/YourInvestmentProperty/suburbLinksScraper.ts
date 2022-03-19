import { SuburbLinkMapping } from "../../domain/YourInvestmentPropertyScraper";
import { Browser } from "playwright";

export class YourInvestmentPropertySuburbLinksScraper {
  #browser: Browser;
  #suburbsListUrl =
    "https://www.yourinvestmentpropertymag.com.au/top-suburbs/vic/";

  constructor(browser: Browser) {
    this.#browser = browser;

    if (!browser) {
      throw new Error("Missing browser");
    }
  }

  async getSuburbLinksMapping(): Promise<SuburbLinkMapping> {
    console.log("Scraping Suburb Links");
    const page = await this.#browser.newPage();
    await page.goto(this.#suburbsListUrl);

    const suburbElements = await page
      .locator(".suburbs > li > a")
      .elementHandles();

    const suburbLinkMapping: SuburbLinkMapping = {};
    for (const e of suburbElements) {
      const suburb = (await e.textContent()) ?? "";
      const relativeLink = (await e.getAttribute("href")) ?? "";
      suburbLinkMapping[suburb] = relativeLink;
    }

    await page.close();

    console.log("Suburb Links: ", JSON.stringify(suburbLinkMapping));

    return suburbLinkMapping;
  }
}
