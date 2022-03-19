import RootScraper from "../adapters/RootScraper";
import {
  YourInvestmentPropertySuburbLinksScraper,
  YourInvestmentPropertySuburbsScraper,
} from "../adapters/YourInvestmentProperty";
import fs from "fs";

(async () => {
  const scraper = await new RootScraper();
  const browser = await scraper.initialise();

  const linkScraper = new YourInvestmentPropertySuburbLinksScraper(browser);
  const links = await linkScraper.getSuburbLinksMapping();

  const suburbsScraper = new YourInvestmentPropertySuburbsScraper(
    browser,
    links
  );

  const result = await suburbsScraper.getSuburbsData();
  console.log("Result: ", result);

  fs.writeFileSync("output.json", JSON.stringify(result));

  await browser.close();
})();
