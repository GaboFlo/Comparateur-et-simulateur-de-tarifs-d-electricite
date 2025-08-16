import dayjs from "dayjs";

import Holidays from "date-holidays";
import allHolidays from "../assets/holidays.json";
import tempoFile from "../statics/hp_hc-BLEU_TEMPO.json";
import flexFile from "../statics/hp_hc-ZEN_FLEX.json";
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
} from "../types";
import { ConsumptionLoadCurveData } from "./csvParser";

export const PRICE_COEFF = 100 * 100000;

const hd = new Holidays("FR");

export const getHolidaysBetweenDates = (range: [Date, Date]) => {
  const holidays: string[] = [];
  let currentDate = range[0];

  while (currentDate <= range[1]) {
    if (isFrenchHoliday(currentDate)) {
      holidays.push(dayjs(currentDate).format("YYYY-MM-DD"));
    }
    currentDate = dayjs(currentDate).add(1, "day").toDate();
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
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Error while finding slot type ${JSON.stringify(
        slotHourTime
      )} ${errorMessage}`
    );
  }
};

export function getSeason(date: Date) {
  const month = dayjs(date).month(); // Get the month (0-indexed)
  const day = dayjs(date).date(); // Get the day of the month

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
): [Date, Date] => {
  if (!data || data.length === 0) {
    // Retourner des dates par défaut si aucune donnée
    const defaultStart = dayjs().subtract(1, "year").startOf("day").toDate();
    const defaultEnd = dayjs().endOf("day").toDate();
    return [defaultStart, defaultEnd];
  }

  const validDates = data
    .map((item) => {
      const date = new Date(item.recordedAt);
      return isNaN(date.getTime()) ? null : date.getTime();
    })
    .filter((time) => time !== null) as number[];

  if (validDates.length === 0) {
    // Retourner des dates par défaut si aucune date valide
    const defaultStart = dayjs().subtract(1, "year").startOf("day").toDate();
    const defaultEnd = dayjs().endOf("day").toDate();
    return [defaultStart, defaultEnd];
  }

  const firstDate = Math.min(...validDates);
  const lastDate = Math.max(...validDates);

  return [new Date(firstDate), new Date(lastDate)];
};

export function isHoliday(endOfSlotRecorded: Date) {
  const holidays = allHolidays;
  const minuteBefore = dayjs(endOfSlotRecorded).subtract(1, "minute");
  return holidays.includes(minuteBefore.format("YYYY-MM-DD"));
}

export function isDayApplicable(mapping: Mapping, endOfSlotRecorded: Date) {
  return (
    mapping.applicableDays.includes(endOfSlotRecorded.getDay()) ||
    (mapping.include_holidays && isHoliday(endOfSlotRecorded))
  );
}

export const getHpHcJson = (overridingHpHcKey: string) => {
  switch (overridingHpHcKey) {
    case "BLEU_TEMPO":
      return tempoFile as HpHcSlot[];
    case "ZEN_FLEX":
      return flexFile as HpHcSlot[];
    default:
      throw new Error(`No hpHcGrid found for key: ${overridingHpHcKey}`);
  }
};

export const formatKWh = (
  value: number,
  includeUnit: boolean = true
): string => {
  const roundedValue = Math.round(value);
  return `${new Intl.NumberFormat("fr-FR").format(roundedValue)}${
    includeUnit ? " kWh" : ""
  }`;
};

export const formatKWhLarge = (value: number): string => {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value)) + " kWh";
};

export const SEASON_COLORS: Record<Season, string> = {
  Été: "#FFD700",
  Hiver: "#1E90FF",
  Automne: "#FF8C00",
  Printemps: "#32CD32",
};

export const getSeasonColor = (season: Season): string => {
  return SEASON_COLORS[season];
};
