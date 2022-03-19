export type SuburbLinkMapping = {
  [key: string]: string;
};

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
  lastUpdated: Date;
};

export type YourInvestmentPropertyData = {
  [PropertyType.HOUSE]: Partial<YourInvestmentPropertyDataFields>;
  [PropertyType.UNIT]: Partial<YourInvestmentPropertyDataFields>;
};

export enum PropertyType {
  HOUSE = "House",
  UNIT = "Unit",
}
