import { getDate, getMonth } from "date-fns";
import Holidays from "date-holidays";
import {
  GridMapping,
  OfferType,
  OptionName,
  PowerClass,
  PriceMappingFile,
  Season,
  SlotType,
} from "../../front/src/types";
import price_mapping from "./price_mapping.json";
import { ConsumptionLoadCurveData } from "./csvParser";
import * as fs from "fs/promises";

export const PRICE_COEFF = 100 * 100000;

const hd = new Holidays("FR");

export function isFrenchHoliday(date: Date): boolean {
  return Boolean(hd.isHoliday(date));
}

export const isHpOrHcSlot = (
  endOfRecordedPeriod: Date,
  grids: GridMapping[]
) => {
  const potentialGrid = grids.find((elt) => {
    return (
      elt.endSlot.hour === endOfRecordedPeriod.getHours() &&
      elt.endSlot.minute === endOfRecordedPeriod.getMinutes()
    );
  });
  if (!potentialGrid) {
    throw new Error(`No grid found for ${endOfRecordedPeriod}`);
  }
  return potentialGrid.slotType as SlotType;
};

export function getSeason(date: Date) {
  const month = getMonth(date); // Get the month (0-indexed)
  const day = getDate(date); // Get the day of the month

  // Define season start and end dates (adjust as needed for your specific definition)
  const seasons = [
    { name: "Hiver", startMonth: 11, startDay: 21, endMonth: 11, endDay: 31 },
    { name: "Hiver", startMonth: 0, startDay: 0, endMonth: 2, endDay: 20 },
    { name: "Printemps", startMonth: 2, startDay: 21, endMonth: 5, endDay: 20 },
    { name: "Été", startMonth: 5, startDay: 21, endMonth: 8, endDay: 20 },
    { name: "Automne", startMonth: 8, startDay: 21, endMonth: 11, endDay: 20 },
  ];

  for (const season of seasons) {
    // Check if the date falls within the season's date range
    if (
      (month === season.startMonth && day >= season.startDay) ||
      (month === season.endMonth && day <= season.endDay) ||
      (month > season.startMonth && month < season.endMonth)
    ) {
      return season.name as Season;
    }
  }
  throw new Error(`Season not found for date: ${date}`);
}

export function findMonthlySubscriptionCost(
  powerClass: PowerClass,
  offerType: OfferType,
  optionName: OptionName
) {
  const priceMappingData = price_mapping as PriceMappingFile;
  for (const elt of priceMappingData) {
    if (elt.offerType === offerType && elt.optionName === optionName) {
      for (const sub of elt.subscriptions) {
        if (sub.powerClass === powerClass) {
          return sub.monthlyCost;
        }
      }
    }
  }
  throw new Error(
    `Subscription not found for powerClass: ${powerClass}, offerType: ${offerType}, optionName: ${optionName}`
  );
}

export const findFirstAndLastDate = (
  data: ConsumptionLoadCurveData[]
): [Date, Date] => {
  const dates = data.map((item) => new Date(item.recordedAt)?.getTime());
  const firstDate = new Date(Math.min(...dates));
  const lastDate = new Date(Math.max(...dates));
  return [firstDate, lastDate];
};

export async function readFileAsString(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);

    if (buffer instanceof Buffer) {
      const fileContent: string = buffer.toString("utf8");
      return fileContent;
    } else {
      console.error(
        "readFile did not return a Buffer.  Check file path and permissions."
      );
      throw new Error("Could not read file as string."); // Ou une autre erreur appropriée
    }
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
}
