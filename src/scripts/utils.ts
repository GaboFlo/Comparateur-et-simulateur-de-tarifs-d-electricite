import axios from "axios";
import { addDays, format, getDate, getMonth, subMinutes } from "date-fns";
import Holidays from "date-holidays";
import allHolidays from "../assets/holidays.json";
import price_mapping from "../statics/price_mapping.json";
import {
  HpHcSlot,
  Mapping,
  OfferType,
  OptionKey,
  PowerClass,
  PriceMappingFile,
  ProviderType,
  Season,
  SlotType,
  TempoDates,
} from "../types";
import { ConsumptionLoadCurveData } from "./csvParser";

export const PRICE_COEFF = 100 * 100000;

const hd = new Holidays("FR");

export const getHolidaysBetweenDates = (range: [Date, Date]) => {
  const holidays: string[] = [];
  let currentDate = range[0];

  while (currentDate <= range[1]) {
    if (isFrenchHoliday(currentDate)) {
      holidays.push(format(new Date(currentDate), "yyyy-MM-dd"));
    }
    currentDate = addDays(currentDate, 1);
  }

  return holidays;
};

function isFrenchHoliday(date: Date): boolean {
  return Boolean(hd.isHoliday(date));
}

export const isHpOrHcSlot = (endOfRecordedPeriod: Date, grids: HpHcSlot[]) => {
  const slotHourTime = {
    hour: endOfRecordedPeriod.getHours(),
    minute: endOfRecordedPeriod.getMinutes(),
  };

  if (!grids || grids.length === 0) {
    throw new Error("No grids found");
  }

  try {
    const potentialGrid = grids.find((elt) => {
      return (
        elt.endSlot.hour === slotHourTime.hour &&
        elt.endSlot.minute === slotHourTime.minute
      );
    });
    if (!potentialGrid) {
      return "HP";
    }
    return potentialGrid.slotType as SlotType;
  } catch (e: any) {
    console.log(slotHourTime, grids, e);
    throw new Error(
      `Error while finding slot type ${JSON.stringify(slotHourTime)} ${
        e.message
      }`
    );
  }
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
  optionKey: OptionKey,
  provider: ProviderType
) {
  const priceMappingData = price_mapping as PriceMappingFile;
  for (const elt of priceMappingData) {
    if (
      elt.offerType === offerType &&
      elt.optionKey === optionKey &&
      elt.provider === provider
    ) {
      for (const sub of elt.subscriptions) {
        if (sub.powerClass === powerClass) {
          return sub.monthlyCost;
        }
      }
    }
  }
  throw new Error(
    `Subscription not found for powerClass: ${powerClass}, offerType: ${offerType}, optionKey: ${optionKey}`
  );
}

export const findFirstAndLastDate = (
  data: ConsumptionLoadCurveData[]
): [number, number] => {
  const dates = data.map((item) => new Date(item.recordedAt)?.getTime());
  const firstDate = Math.min(...dates);
  const lastDate = Math.max(...dates);
  return [firstDate, lastDate];
};

export async function fetchTempoData() {
  try {
    const response = await axios
      .get(
        "https://www.api-couleur-tempo.fr/api/joursTempo?periode%5B%5D=2024-2025&periode%5B%5D=2023-2024&periode%5B%5D=2022-2023"
      )
      .then((res) => res.data);

    return response as TempoDates;
  } catch {
    throw new Error("Error fetching tempo data");
  }
}

export function isHoliday(endOfSlotRecorded: Date) {
  const holidays = allHolidays;
  const minuteBefore = subMinutes(endOfSlotRecorded, 1);
  return holidays.includes(format(minuteBefore, "yyyy-MM-dd"));
}

export function isDayApplicable(mapping: Mapping, endOfSlotRecorded: Date) {
  return (
    mapping.applicableDays.includes(endOfSlotRecorded.getDay()) ||
    (mapping.include_holidays && isHoliday(endOfSlotRecorded))
  );
}

export const getAnalyzedDateRange = (
  data: ConsumptionLoadCurveData[],
  askedDateRange: [Date, Date]
): [number, number] => {
  const dateRangeOfFile = findFirstAndLastDate(data);
  return [
    Math.max(dateRangeOfFile[0], askedDateRange[0].getTime()),
    Math.min(dateRangeOfFile[1], askedDateRange[1].getTime()),
  ];
};

export const getHpHcJson = (overridingHpHcKey: string) => {
  // TODO
  return [];
};
