import { differenceInMonths, format, subDays } from "date-fns";
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

interface CalculateProps {
  data: CalculatedData[];
  optionKey: OptionKey;
  offerType: OfferType;
  tempoDates?: TempoDates;
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
        if (!singleMapping.price) {
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
  hphc_mapping: HpHcFileMapping[],
  endOfSlotRecorded: Date,
  mapping: Mapping,
  option: Option,
  item: CalculatedData
): Cost {
  const commonThrowError = `${option.offerType}-${
    option.optionKey
  }-${endOfSlotRecorded.toISOString()}`;

  const applicableHpHcGrids = hphc_mapping.find((item) =>
    item.offerType.includes(option.offerType)
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
        cost: (hpHcConfig.price * item.value) / 2,
        hourType: slotType,
      };
    }
  }
  if (!new_cost) {
    throw new Error(`No slotType found ${commonThrowError} ${slotType}`);
  }
  return new_cost;
}

function isHpOrHcTempoSlot(hour: number, minute: number): SlotType {
  if (
    (6 < hour && hour < 22) ||
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
  const endOfSlotRecorded = new Date(item.recordedAt);
  const hour = endOfSlotRecorded.getHours();
  const minute = endOfSlotRecorded.getMinutes();

  const slotType = isHpOrHcTempoSlot(hour, minute);

  let dateKey: string;
  if (hour < 6 || (hour === 6 && minute === 0)) {
    const yesterday = subDays(endOfSlotRecorded, 1);
    dateKey = format(yesterday, "yyyy-MM-dd");
  } else {
    dateKey = format(endOfSlotRecorded, "yyyy-MM-dd");
  }

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
}: CalculateProps): Promise<FullCalculatedData> {
  const priceMappingData = price_mapping as PriceMappingFile;
  const hpHcMappingData = hphc_mapping as HpHcFile;
  const option = priceMappingData.find(
    (item) => item.optionKey === optionKey && item.offerType === offerType
  );
  if (!option) {
    throw new Error(`No option found ${offerType}-${optionKey}`);
  }

  const new_data: CalculatedData[] = [];
  let totalCost = 0;

  let tempoDatesMap: Record<string, TempoCodeDay> = {};
  let tempoMappingMap: Partial<Record<string, TempoMapping>> = {};
  if (option.tempoMappings) {
    const tempoDates = tempo_file as TempoDates;
    tempoDatesMap = tempoDates.reduce((acc, t) => {
      acc[t.dateJour] = t.codeJour;
      return acc;
    }, {} as Record<string, TempoCodeDay>);

    tempoMappingMap = option.tempoMappings.reduce<
      Partial<Record<string, TempoMapping>>
    >((acc, mapping) => {
      acc[mapping.tempoCodeDay.toString()] = mapping;
      return acc;
    }, {});
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
      new_data.push({
        ...item,
        costs: [...(item.costs ?? []), new_cost],
      });
    } else {
      throw new Error(`No new_cost found ${commonThrowError}`);
    }
  }

  return { detailedData: new_data, totalCost, offerType, optionKey };
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
  const now = new Date();

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
    computeTime: new Date().getTime() - now.getTime(),
  } as ComparisonTableInterfaceRow;
}
