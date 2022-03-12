import {
  Scraper,
  YourInvestmentPropertyData,
  PropertyType,
} from "../domain/YourInvestmentPropertyScraper";
import { Browser, Page } from "playwright";

export default class YourInvestmentPropertyScraper implements Scraper {
  #browser: Browser;
  #suburbUrls: string[];

  constructor(browser: Browser, suburbUrls: string[]) {
    this.#browser = browser;

    if (!browser) {
      throw new Error("Missing browser");
    }
    this.#suburbUrls = suburbUrls;
  }

  async getData(): Promise<YourInvestmentPropertyData> {
    const testFirstUrl = this.#suburbUrls[0];

    const page = await this.#browser.newPage();
    await page.goto(testFirstUrl);

    const propertyRawData = await Promise.all(
      [PropertyType.HOUSE, PropertyType.UNIT].map((type) =>
        Promise.all([
          this.#getMedianPrice(page, type),
          this.#getQuarterlyGrowth(page, type),
          this.#getAnnualGrowth(page, type),
          this.#getTenYearGrowth(page, type),
          this.#getWeeklyAnnualRent(page, type),
          this.#getNumberOfAnnualSales(page, type),
          this.#getGrossAnnualRentalYield(page, type),
          this.#getDaysOnMarket(page, type),
          this.#getDsrRating(page, type),
        ])
      )
    );

    return [PropertyType.HOUSE, PropertyType.UNIT].reduce(
      (finalData, type, i) => {
        const [
          medianPrice,
          quarterlyGrowth,
          annualGrowth,
          tenYearGrowth,
          weeklyAnnualRent,
          numberOfAnnualSales,
          grossAnnualRentalYield,
          daysOnMarket,
          dsrRating,
        ] = propertyRawData[i];

        return {
          ...finalData,
          [type]: {
            medianPrice,
            quarterlyGrowth,
            annualGrowth,
            tenYearGrowth,
            weeklyAnnualRent,
            numberOfAnnualSales,
            grossAnnualRentalYield,
            daysOnMarket,
            dsrRating,
          },
        };
      },
      {} as YourInvestmentPropertyData
    );
  }

  async #getMedianPrice(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page.locator(`.align_r.${type}.Median`).textContent()) ?? "$0"
    );
  }

  async #getQuarterlyGrowth(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page.locator(`.align_r.${type}.QuarterlyGrowth`).textContent()) ??
        "%0"
    );
  }

  async #getAnnualGrowth(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page
        .locator(
          // have to use XPath as Selector does not like classes beginning with numbers
          `//td[contains(@class, 'align_r') and contains(@class, '${type}') and contains(@class, '1yr')]`
        )
        .textContent()) ?? "%0"
    );
  }

  async #getTenYearGrowth(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page
        .locator(`.align_r.${type}.MedianGrowthThisYr`) // not a typo MedianGrowthThisYr -> 10 year growth
        .textContent()) ?? "%0"
    );
  }

  async #getWeeklyAnnualRent(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page
        .locator(`.align_r.${type}.WeeklyMedianAdvertisedRent`)
        .textContent()) ?? "%0"
    );
  }

  async #getNumberOfAnnualSales(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page.locator(`.align_r.${type}.NumberSold`).textContent()) ?? "%0"
    );
  }

  async #getGrossAnnualRentalYield(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page.locator(`.align_r.${type}.GrossRentalYield`).textContent()) ??
        "%0"
    );
  }

  async #getDaysOnMarket(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page.locator(`.align_r.${type}.DaysOnMarket`).textContent()) ??
        "%0"
    );
  }

  async #getDsrRating(page: Page, type: PropertyType) {
    const dsrScoreRow = page.locator(
      `//*[contains(@class, "dsr") and .//*[contains(text(), 'DSR Score')]]`
    );
    const dsrScoreElements = dsrScoreRow.locator(".avg");
    switch (type) {
      case PropertyType.HOUSE:
        return dsrScoreElements.nth(0).textContent();
      case PropertyType.UNIT:
        return dsrScoreElements.nth(1).textContent();
    }
  }

  #formatScrappedTextAsNumber = (text: string) =>
    Number(text.trim().replace(/[^0-9.-]+/g, ""));
}
