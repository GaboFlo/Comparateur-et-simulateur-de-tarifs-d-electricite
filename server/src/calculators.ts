import { differenceInMonths } from "date-fns";
import tempo_file from "../assets/tempo.json";
import hphc_mapping from "../statics/hp_hc.json";
import price_mapping from "../statics/price_mapping.json";
import {
  CalculatedData,
  ComparisonTableInterfaceRow,
  ConsumptionLoadCurveData,
  Cost,
  FullCalculatedData,
  HpHcFile,
  HpHcFileMapping,
  Mapping,
  OfferType,
  Option,
  OptionKey,
  PowerClass,
  PriceMappingFile,
  SlotType,
  TempoCodeDay,
  TempoDates,
  TempoMapping,
} from "./types";
import {
  findMonthlySubscriptionCost,
  isDayApplicable,
  isHpOrHcSlot,
  PRICE_COEFF,
} from "./utils";

function parseTime(isoString: string): { hour: number; minute: number } {
  const hour = +isoString.slice(11, 13);
  const minute = +isoString.slice(14, 16);
  return { hour, minute };
}

function getDateKey(isoString: string): string {
  const baseDate = isoString.slice(0, 10); // "YYYY-MM-DD"
  const { hour, minute } = parseTime(isoString);
  if (hour < 6 || (hour === 6 && minute === 0)) {
    const year = +baseDate.slice(0, 4);
    const month = +baseDate.slice(5, 7);
    const day = +baseDate.slice(8, 10);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
  }
  return baseDate;
}

function findCorrespondingMapping(
  option: Option,
  endOfSlotRecorded: Date,
  hpHcMappingData: HpHcFileMapping[],
  item: CalculatedData
): Cost {
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
        if (singleMapping.price === undefined) {
          throw new Error(`No price found ${endOfSlotRecorded.toISOString()}`);
        }
        return {
          cost: (singleMapping.price * item.value) / 2,
        } as Cost;
      }
    }
  }
  throw new Error(`No mapping found ${endOfSlotRecorded.toISOString()}`);
}

function calculateHpHcPrices(
  hphcMapping: HpHcFileMapping[],
  endOfSlotRecorded: Date,
  mapping: Mapping,
  option: Option,
  item: CalculatedData
): Cost {
  const commonThrowError = `${option.offerType}-${
    option.optionKey
  }-${endOfSlotRecorded.toISOString()}`;
  const applicableHpHcGrids = hphcMapping.find((hpItem) =>
    hpItem.offerType.includes(option.offerType)
  )?.grids;
  if (!applicableHpHcGrids || !mapping.hpHcConfig) {
    throw new Error(
      `No applicableHpHcGrids found or hpHcConfig missing ${commonThrowError}`
    );
  }
  const slotType = isHpOrHcSlot(endOfSlotRecorded, applicableHpHcGrids);
  const configMap: Record<SlotType, number> = {} as Record<SlotType, number>;
  for (const config of mapping.hpHcConfig) {
    configMap[config.slotType] = config.price;
  }
  if (configMap[slotType] === undefined) {
    throw new Error(`No slotType found ${commonThrowError} ${slotType}`);
  }
  return {
    cost: (configMap[slotType] * item.value) / 2,
    hourType: slotType,
  };
}

function isHpOrHcTempoSlot(hour: number, minute: number): SlotType {
  if (
    (hour > 6 && hour < 22) ||
    (hour === 22 && minute === 0) ||
    (hour === 6 && minute === 30)
  ) {
    return "HP";
  } else {
    return "HC";
  }
}

function calculateTempoPricesOptimized(
  item: CalculatedData,
  tempoDatesMap: Record<string, TempoCodeDay>,
  tempoMappingMap: Partial<Record<string, TempoMapping>>
): Cost {
  const { hour, minute } = parseTime(item.recordedAt);
  const slotType = isHpOrHcTempoSlot(hour, minute);
  const dateKey = getDateKey(item.recordedAt);

  const tempoCodeDay = tempoDatesMap[dateKey];
  if (tempoCodeDay === undefined || tempoCodeDay === null) {
    throw new Error(`No tempoCodeDay found for date ${dateKey}`);
  }
  const relevantTempoMapping = tempoMappingMap[String(tempoCodeDay)];
  if (!relevantTempoMapping) {
    throw new Error(
      `No relevantTempoMapping found for codeJour ${tempoCodeDay}`
    );
  }
  const relevantCost =
    slotType === "HP" ? relevantTempoMapping.HP : relevantTempoMapping.HC;
  return {
    cost: (item.value * relevantCost) / 2,
    hourType: slotType,
    tempoCodeDay,
  };
}

export async function calculatePrices({
  data,
  optionKey,
  offerType,
}: {
  data: CalculatedData[];
  optionKey: OptionKey;
  offerType: OfferType;
  tempoDates?: TempoDates;
}): Promise<FullCalculatedData> {
  const priceMappingData = price_mapping as PriceMappingFile;
  const hpHcMappingData = hphc_mapping as HpHcFile;
  const option = priceMappingData.find(
    (item) => item.optionKey === optionKey && item.offerType === offerType
  );
  if (!option) {
    throw new Error(`No option found ${offerType}-${optionKey}`);
  }

  const newData: CalculatedData[] = [];
  let totalCost = 0;

  const tempoDatesMap: Record<string, TempoCodeDay> = {};
  const tempoMappingMap: Partial<Record<string, TempoMapping>> = {};
  if (option.tempoMappings) {
    const tempoDates = tempo_file as TempoDates;
    for (const t of tempoDates) {
      tempoDatesMap[t.dateJour] = t.codeJour;
    }
    for (const mapping of option.tempoMappings) {
      tempoMappingMap[mapping.tempoCodeDay.toString()] = mapping;
    }
  }

  for (const item of data) {
    const endOfSlotRecorded = new Date(item.recordedAt);
    const commonThrowError = `${offerType}-${optionKey}-${endOfSlotRecorded.toISOString()}`;

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
      new_cost = calculateTempoPricesOptimized(
        item,
        tempoDatesMap,
        tempoMappingMap
      );
    }
    if (new_cost) {
      totalCost += new_cost.cost;
      newData.push({
        ...item,
        costs: [...(item.costs ?? []), new_cost],
      });
    } else {
      throw new Error(`No new_cost found ${commonThrowError}`);
    }
  }

  return { detailedData: newData, totalCost, offerType, optionKey };
}

interface FullCalculatePricesInterface {
  data: ConsumptionLoadCurveData[];
  powerClass: PowerClass;
  dateRange: [Date, Date];
  optionKey: OptionKey;
  offerType: OfferType;
  optionName: string;
  link: string;
}

export async function calculateRowSummary({
  data,
  powerClass,
  dateRange,
  optionKey,
  optionName,
  link,
  offerType,
}: FullCalculatePricesInterface): Promise<ComparisonTableInterfaceRow> {
  const startTime = Date.now();

  const calculatedData = await calculatePrices({
    data,
    offerType,
    optionKey,
  });

  const monthlyCost = findMonthlySubscriptionCost(
    powerClass,
    offerType,
    optionKey
  );

  return {
    provider: "EDF",
    offerType,
    optionKey,
    optionName,
    link,
    totalConsumptionCost: Math.round(calculatedData.totalCost / PRICE_COEFF),
    monthlyCost: monthlyCost / 100,
    total: Math.round(
      calculatedData.totalCost / PRICE_COEFF +
        (monthlyCost * (differenceInMonths(dateRange[1], dateRange[0]) + 1)) /
          100
    ),
    computeTime: Date.now() - startTime,
  } as ComparisonTableInterfaceRow;
}
