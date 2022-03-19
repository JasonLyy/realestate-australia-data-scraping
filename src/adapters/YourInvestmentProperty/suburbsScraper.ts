import {
  YourInvestmentPropertyData,
  PropertyType,
  SuburbLinkMapping,
} from "../../domain/YourInvestmentPropertyScraper";
import { Browser, Page } from "playwright";

export class YourInvestmentPropertySuburbsScraper {
  #browser: Browser;
  #suburbUrls: SuburbLinkMapping;

  constructor(browser: Browser, suburbUrls: SuburbLinkMapping) {
    this.#browser = browser;
    this.#suburbUrls = suburbUrls;
  }

  async getSuburbsData(): Promise<{
    [key: keyof SuburbLinkMapping]: YourInvestmentPropertyData;
  }> {
    const baseUrl = "https://www.yourinvestmentpropertymag.com.au";

    const fullSuburbLinkMapping = Object.keys(this.#suburbUrls).reduce(
      (mapping, suburb) => {
        return {
          ...mapping,
          [suburb]: `${baseUrl}${this.#suburbUrls[suburb]}`,
        };
      },
      this.#suburbUrls
    );

    const entries = Object.entries(fullSuburbLinkMapping);

    const totalSuburbData: {
      [x: string]: YourInvestmentPropertyData;
    }[] = [];
    while (entries.length) {
      const suburbData = await Promise.all(
        entries.splice(0, 10).map(async ([suburb, url]) => ({
          [suburb]: await this.#getSuburbData(url),
        }))
      );
      totalSuburbData.concat(suburbData);
    }

    return totalSuburbData.reduce((acc, curr) => {
      return {
        ...acc,
        ...curr,
      };
    });
  }

  async #getSuburbData(url: string): Promise<YourInvestmentPropertyData> {
    console.log("Scraping: ", url);
    const testFirstUrl = url;

    const context = await this.#browser.newContext();
    const page = await context.newPage();
    await page
      .goto(testFirstUrl, {
        waitUntil: "domcontentloaded",
      })
      .catch((e) => {
        console.log(e);
        return;
      });

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
    ).catch((e) => {
      console.log(e);
      return [
        [-1, -1, -1, -1, -1, -1, -1, -1, "Error"],
        [-1, -1, -1, -1, -1, -1, -1, -1, "Error"],
      ];
    });

    console.log("Scraped: ", url);
    await context.close();
    await page.close();

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
      (await page
        .locator(`.align_r.${type}.Median`)
        .textContent({ timeout: 2000 })) ?? "$0"
    );
  }

  async #getQuarterlyGrowth(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page
        .locator(`.align_r.${type}.QuarterlyGrowth`)
        .textContent({ timeout: 2000 })) ?? "%0"
    );
  }

  async #getAnnualGrowth(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page
        .locator(
          // have to use XPath as Selector does not like classes beginning with numbers
          `//td[contains(@class, 'align_r') and contains(@class, '${type}') and contains(@class, '1yr')]`
        )
        .textContent({ timeout: 2000 })) ?? "%0"
    );
  }

  async #getTenYearGrowth(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page
        .locator(`.align_r.${type}.MedianGrowthThisYr`) // not a typo MedianGrowthThisYr -> 10 year growth
        .textContent({ timeout: 2000 })) ?? "%0"
    );
  }

  async #getWeeklyAnnualRent(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page
        .locator(`.align_r.${type}.WeeklyMedianAdvertisedRent`)
        .textContent({ timeout: 2000 })) ?? "%0"
    );
  }

  async #getNumberOfAnnualSales(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page
        .locator(`.align_r.${type}.NumberSold`)
        .textContent({ timeout: 2000 })) ?? "%0"
    );
  }

  async #getGrossAnnualRentalYield(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page
        .locator(`.align_r.${type}.GrossRentalYield`)
        .textContent({ timeout: 2000 })) ?? "%0"
    );
  }

  async #getDaysOnMarket(page: Page, type: PropertyType) {
    return this.#formatScrappedTextAsNumber(
      (await page
        .locator(`.align_r.${type}.DaysOnMarket`)
        .textContent({ timeout: 2000 })) ?? "%0"
    );
  }

  async #getDsrRating(page: Page, type: PropertyType) {
    const dsrScoreRow = page.locator(
      `//*[contains(@class, "dsr") and .//*[contains(text(), 'DSR Score')]]`
    );
    const dsrScoreElements = dsrScoreRow.locator(".avg");
    switch (type) {
      case PropertyType.HOUSE:
        return (
          (await dsrScoreElements.nth(0).textContent({ timeout: 2000 })) ?? ""
        );
      case PropertyType.UNIT:
        return (
          (await dsrScoreElements.nth(1).textContent({ timeout: 2000 })) ?? ""
        );
      default:
        return "Error DSR Score";
    }
  }

  #formatScrappedTextAsNumber = (text: string) =>
    Number(text.trim().replace(/[^0-9.-]+/g, ""));
}
