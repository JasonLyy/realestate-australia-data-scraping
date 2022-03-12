export interface Scraper {
  getData(): Promise<YourInvestmentPropertyData>;
}

export type YourInvestmentPropertyDataFields = {
  medianPrice: number;
  quarterlyGrowth: number;
  annualGrowth: number;
  tenYearGrowth: number;
  weeklyAnnualRent: number;
  numberOfAnnualSales: number;
  grossAnnualRentalYield: number;
  daysOnMarket: number;
  dsrRating: string;
};

export type YourInvestmentPropertyData = {
  [PropertyType.HOUSE]: Partial<YourInvestmentPropertyDataFields>;
  [PropertyType.UNIT]: Partial<YourInvestmentPropertyDataFields>;
};

export enum PropertyType {
  HOUSE = "House",
  UNIT = "Unit",
}
