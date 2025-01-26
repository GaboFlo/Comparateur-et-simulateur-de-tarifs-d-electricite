import {
  endOfDay,
  format,
  isWithinInterval,
  startOfDay,
  subDays,
} from "date-fns";
import fetch from "node-fetch";
import { getAvailableOptionsForOffer } from "../components/CurrentOfferForm";
import {
  CalculatedData,
  ComparisonTableInterfaceRow,
  ConsumptionLoadCurveData,
  Cost,
  HpHcFile,
  HpHcFileMapping,
  Mapping,
  OfferType,
  Option,
  OptionName,
  PowerClass,
  PriceMappingFile,
  SlotType,
  TempoCodeDay,
  TempoDates,
  TempoMapping,
} from "../types";
import hphc_mapping from "./hp_hc.json";
import price_mapping from "./price_mapping.json";
import {
  findMonthlySubscriptionCost,
  isFrenchHoliday,
  isHpOrHcSlot,
} from "./utils";

interface CalculateProps {
  data: CalculatedData[];
  optionName: OptionName;
  offerType: OfferType;
  dateRange?: [Date, Date];
  tempoDates?: TempoDates;
}

function isDayApplicable(mapping: Mapping, endOfSlotRecorded: Date) {
  return (
    mapping.applicableDays.includes(endOfSlotRecorded.getDay()) ||
    (mapping.include_holidays && isFrenchHoliday(endOfSlotRecorded))
  );
}

function findCorrespondingMapping(
  option: Option,
  endOfSlotRecorded: Date,
  hpHcMappingData: HpHcFileMapping[],
  item: CalculatedData
) {
  for (const singleMapping of option.mappings) {
    if (isDayApplicable(singleMapping, endOfSlotRecorded)) {
      if (singleMapping.hpHcConfig) {
        return calculateHpHcPrices(
          hpHcMappingData,
          endOfSlotRecorded,
          singleMapping,
          option,
          item
        );
      } else {
        if (!singleMapping.price) {
          throw new Error(`No price found ${endOfSlotRecorded.toISOString()}`);
        }
        return {
          optionName: option.optionName,
          offerType: option.offerType,
          cost: singleMapping.price * item.value,
        } as Cost;
      }
    } else {
      throw new Error(
        `No applicableDays found nor include_holidays ${endOfSlotRecorded}`
      );
    }
  }
}

function calculateHpHcPrices(
  hphc_mapping: HpHcFileMapping[],
  endOfSlotRecorded: Date,
  mapping: Mapping,
  option: Option,
  item: CalculatedData
): Cost {
  const commonThrowError = `${option.offerType}-${
    option.optionName
  }-${endOfSlotRecorded.toISOString()}`;

  const applicableHpHcGrids = hphc_mapping.find(
    (item) => item.offerType === option.offerType
  )?.grids;
  if (!applicableHpHcGrids || !mapping.hpHcConfig) {
    throw new Error(
      `No applicableHpHcGrids found or hpHcConfig missing ${commonThrowError}`
    );
  }
  const slotType = isHpOrHcSlot(endOfSlotRecorded, applicableHpHcGrids);
  let new_cost: Cost | null = null;
  for (const hpHcConfig of mapping.hpHcConfig) {
    if (hpHcConfig.slotType === slotType) {
      if (new_cost) {
        throw new Error(
          `Multiple slotType found ${commonThrowError} ${slotType}`
        );
      }
      new_cost = {
        optionName: option.optionName,
        offerType: option.offerType,
        cost: hpHcConfig.price * item.value,
        hourType: slotType,
      };
    }
  }
  if (!new_cost) {
    throw new Error(`No slotType found ${commonThrowError} ${slotType}`);
  }
  return new_cost;
}

export async function fetchTempoData() {
  try {
    const response = await fetch(
      "https://www.api-couleur-tempo.fr/api/joursTempo?periode%5B%5D=2024-2025&periode%5B%5D=2023-2024&periode%5B%5D=2022-2023"
    );
    const res: TempoDates = await response.json();
    return res;
  } catch {
    return undefined;
  }
}

function isHpOrHcTempoSlot(hour: number, minute: number): SlotType {
  if (
    (6 < hour && hour < 22) ||
    (hour === 22 && minute == 0) ||
    (hour === 6 && minute == 30)
  ) {
    return "HP";
  } else {
    return "HC";
  }
}

function calculateTempoPrices(
  tempoDates: TempoDates,
  item: CalculatedData,
  tempoMapping: TempoMapping[]
): Cost {
  // Determine hourType
  const endOfSlotRecorded = new Date(item.recordedAt);
  const hour = endOfSlotRecorded.getHours();
  const minute = endOfSlotRecorded.getMinutes();

  let tempoCodeDay: TempoCodeDay | undefined = undefined;
  const slotType = isHpOrHcTempoSlot(hour, minute);

  // Determine codeJour (handling the day change at midnight)
  if (0 <= hour && (hour < 6 || (hour === 6 && minute == 0))) {
    const dayBefore = subDays(endOfSlotRecorded, 1);
    const yesterdayStr = format(dayBefore, "yyyy-MM-dd");
    tempoCodeDay = tempoDates.find(
      (item) => item.dateJour === yesterdayStr
    )?.codeJour;
  } else {
    tempoCodeDay = tempoDates.find(
      (item) => item.dateJour === format(endOfSlotRecorded, "yyyy-MM-dd")
    )?.codeJour;
  }

  const relevantTempoMapping = tempoMapping.find((elt) => {
    return elt.tempoCodeDay == tempoCodeDay;
  });
  if (!relevantTempoMapping) {
    throw new Error(`No relevantTempoMapping found ${tempoCodeDay}`);
  }
  const relevantCost =
    slotType === "HP" ? relevantTempoMapping.HP : relevantTempoMapping.HC;
  return {
    optionName: OptionName.TEMPO,
    offerType: OfferType.BLEU,
    cost: item.value * relevantCost,
    hourType: slotType,
    tempoCodeDay,
  };
}

export function calculatePrices({
  data,
  optionName,
  offerType,
  dateRange,
  tempoDates,
}: CalculateProps): CalculatedData[] {
  const priceMappingData = price_mapping as PriceMappingFile;
  const hpHcMappingData = hphc_mapping as HpHcFile;
  const option = priceMappingData.find(
    (item) => item.optionName === optionName && item.offerType === offerType
  );
  if (!option) {
    throw new Error(`No option found ${offerType}-${optionName}`);
  }
  const new_data: CalculatedData[] = [];
  if (dateRange) {
    data = data.filter((elt) => {
      return isWithinInterval(elt.recordedAt, {
        start: startOfDay(dateRange[0]),
        end: endOfDay(dateRange[1]),
      });
    });
  }
  data.forEach(async (item) => {
    const endOfSlotRecorded = new Date(item.recordedAt);
    const commonThrowError = `${offerType}-${optionName}-${endOfSlotRecorded.toISOString()}`;

    let new_cost: Cost | undefined = undefined;

    if (option.mappings) {
      new_cost = findCorrespondingMapping(
        option,
        endOfSlotRecorded,
        hpHcMappingData,
        item
      );
    }
    if (option.tempoMappings) {
      if (!tempoDates) {
        throw new Error(`No tempoDates found ${commonThrowError}`);
      }
      new_cost = calculateTempoPrices(tempoDates, item, option.tempoMappings);
    }

    if (new_cost) {
      new_data.push({
        ...item,
        costs: [...(item.costs ?? []), new_cost],
      });
    } else {
      throw new Error(`No new_cost found ${commonThrowError}`);
    }
  });

  return new_data;
}

interface FullCalculatePricesInterface {
  data: ConsumptionLoadCurveData[];
  powerClass: PowerClass;
  dateRange?: [Date, Date];
  tempoDates?: TempoDates;
}
export function calculateForAllOptions({
  data,
  powerClass,
  dateRange,
  tempoDates,
}: FullCalculatePricesInterface) {
  const allOfferTypes = Object.keys(OfferType) as OfferType[];
  const summarizedData: ComparisonTableInterfaceRow[] = [];
  let fullData: CalculatedData[] = data;

  allOfferTypes.forEach((offerType) => {
    const availableOptions = getAvailableOptionsForOffer(offerType);
    availableOptions.forEach(async (optionName) => {
      fullData = await calculatePrices({
        data: fullData,
        offerType,
        optionName,
        dateRange,
        tempoDates,
      });
      const fullCost = fullData.reduce((acc, item) => {
        if (item.costs && item.costs.length > 0) {
          return acc + item.costs[0].cost;
        }
        return acc;
      }, 0);
      const monthlyCost = findMonthlySubscriptionCost(
        powerClass,
        offerType,
        optionName
      );
      const summaryRow: ComparisonTableInterfaceRow = {
        provider: "EDF",
        offerType,
        optionName,
        totalConsumptionCost: fullCost,
        monthlyCost,
        total: 900,
      };
      summarizedData.push(summaryRow);
    });
  });
  return { summarizedData, fullData };
}
