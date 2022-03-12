import RealestateScraper from "../adapters/YourInvestmentpropertyScraper";
import RootScraper from "../adapters/RootScraper";

(async () => {
  const scraper = await new RootScraper().initialise();

  const realestateScraper = new RealestateScraper(scraper, [
    "https://www.yourinvestmentpropertymag.com.au/top-suburbs/vic-3019-braybrook.aspx",
  ]);

  console.log(await realestateScraper.getData());
})();
