import dayjs from "dayjs";
import tempo_data from "../assets/tempo.json";
import price_mapping from "../statics/price_mapping.json";
import {
  CalculatedData,
  ComparisonTableInterfaceRow,
  Cost,
  FullCalculatedData,
  HpHcSeasonAnalysis,
  HpHcSlot,
  Mapping,
  OfferType,
  Option,
  OptionKey,
  OverridingHpHcKey,
  PowerClass,
  PriceMappingFile,
  ProviderType,
  Season,
  SlotType,
  TempoCodeDay,
  TempoDates,
  TempoMapping,
} from "../types";
import { ConsumptionLoadCurveData } from "./csvParser";
import {
  findMonthlySubscriptionCost,
  getHpHcJson,
  getSeason,
  isDayApplicable,
  isHpOrHcSlot,
  PRICE_COEFF,
} from "./utils";

export function parseTime(isoString: string): { hour: number; minute: number } {
  const hour = +isoString.slice(11, 13);
  const minute = +isoString.slice(14, 16);
  return { hour, minute };
}

export function getTempoDateKey(isoString: string): string {
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
  hpHcMappingData: HpHcSlot[],
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
  hphcMapping: HpHcSlot[],
  endOfSlotRecorded: Date,
  mapping: Mapping,
  option: Option,
  item: CalculatedData
): Cost {
  const commonThrowError = `${option.offerType}-${
    option.optionKey
  }-${endOfSlotRecorded.toISOString()}`;

  if (!mapping.hpHcConfig) {
    throw new Error(
      `No applicableHpHcGrids found or hpHcConfig missing ${commonThrowError}`
    );
  }
  const slotType = isHpOrHcSlot(endOfSlotRecorded, hphcMapping);
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

function calculateTempoPricesOptimized(
  item: CalculatedData,
  tempoDatesMap: Record<string, TempoCodeDay>,
  tempoMappingMap: Partial<Record<string, TempoMapping>>,
  customHpHcGrid: HpHcSlot[]
): Cost {
  const slotType = isHpOrHcSlot(new Date(item.recordedAt), customHpHcGrid);
  const dateKey = getTempoDateKey(item.recordedAt);

  const tempoCodeDay = tempoDatesMap[dateKey];
  if (tempoCodeDay == null) {
    console.error(tempoDatesMap);
    console.error(dateKey);
    console.error(item.recordedAt);
    throw new Error(
      `TempoCodeDay ${tempoCodeDay} found for date ${dateKey} - ${item.recordedAt}`
    );
  }
  const relevantTempoMapping = tempoMappingMap[String(tempoCodeDay)];
  if (!relevantTempoMapping) {
    throw new Error(
      `No relevantTempoMapping found for codeJour ${tempoCodeDay}`
    );
  }
  const relevantCost =
    slotType === "HC" ? relevantTempoMapping.HC : relevantTempoMapping.HP;
  return {
    cost: (item.value * relevantCost) / 2,
    hourType: slotType,
    tempoCodeDay,
  };
}

export function calculatePrices({
  data,
  optionKey,
  offerType,
  hpHcData,
  provider,
}: {
  data: CalculatedData[];
  optionKey: OptionKey;
  offerType: OfferType;
  tempoDates?: TempoDates;
  hpHcData: HpHcSlot[];
  provider: ProviderType;
}): FullCalculatedData {
  const priceMappingData = price_mapping as PriceMappingFile;
  const option = priceMappingData.find(
    (item) =>
      item.optionKey === optionKey &&
      item.offerType === offerType &&
      item.provider === provider
  );
  if (!option) {
    throw new Error(`No option found ${offerType}-${optionKey}`);
  }

  const newData: CalculatedData[] = [];
  let totalCost = 0;

  const tempoDatesMap: Record<string, TempoCodeDay> = {};
  const tempoMappingMap: Partial<Record<string, TempoMapping>> = {};
  if (option.tempoMappings) {
    const tempoDates = tempo_data as TempoDates;
    for (const t of tempoDates) {
      tempoDatesMap[t.dateJour] = t.codeJour;
    }
    for (const mapping of option.tempoMappings) {
      tempoMappingMap[mapping.tempoCodeDay.toString()] = mapping;
    }
  }
  const hpHcGrid: HpHcSlot[] = option.overridingHpHcKey
    ? getHpHcJson(option.overridingHpHcKey)
    : hpHcData;

  for (const item of data) {
    const endOfSlotRecorded = new Date(item.recordedAt);
    const commonThrowError = `${offerType}-${optionKey}-${endOfSlotRecorded.toISOString()}`;

    let new_cost: Cost | undefined = undefined;
    if (option.mappings) {
      new_cost = findCorrespondingMapping(
        option,
        endOfSlotRecorded,
        hpHcGrid,
        item
      );
    }
    if (option.tempoMappings) {
      if (!option.overridingHpHcKey) {
        throw new Error(`No overridingHpHcKey found ${commonThrowError}`);
      }
      new_cost = calculateTempoPricesOptimized(
        item,
        tempoDatesMap,
        tempoMappingMap,
        hpHcGrid
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
  lastUpdate: string;
  hpHcData: HpHcSlot[];
  overridingHpHcKey?: OverridingHpHcKey;
  provider: ProviderType;
}

export function calculateRowSummary({
  data,
  powerClass,
  dateRange,
  optionKey,
  optionName,
  link,
  lastUpdate,
  offerType,
  hpHcData,
  provider,
  overridingHpHcKey,
}: FullCalculatePricesInterface): ComparisonTableInterfaceRow {
  const calculatedData = calculatePrices({
    data,
    offerType,
    optionKey,
    hpHcData,
    provider,
  });

  const monthlyCost = findMonthlySubscriptionCost(
    powerClass,
    offerType,
    optionKey,
    provider
  );

  const fullSubscriptionCost = Math.round(
    (monthlyCost *
      (dayjs(dateRange[1]).diff(dayjs(dateRange[0]), "month") + 1)) /
      100
  );

  return {
    provider,
    offerType,
    optionKey,
    optionName,
    link,
    lastUpdate,
    totalConsumptionCost: Math.round(calculatedData.totalCost / PRICE_COEFF),
    fullSubscriptionCost,
    total: Math.round(
      calculatedData.totalCost / PRICE_COEFF + fullSubscriptionCost
    ),
    overridingHpHcKey,
  } as ComparisonTableInterfaceRow;
}

export function calculateHpHcSeasonAnalysis(
  data: ConsumptionLoadCurveData[],
  hpHcMapping: HpHcSlot[]
): HpHcSeasonAnalysis[] {
  const seasonData: Record<Season, { total: number; HP: number; HC: number }> =
    {
      Été: { total: 0, HP: 0, HC: 0 },
      Hiver: { total: 0, HP: 0, HC: 0 },
      Automne: { total: 0, HP: 0, HC: 0 },
      Printemps: { total: 0, HP: 0, HC: 0 },
    };

  for (const item of data) {
    const date = new Date(item.recordedAt);
    const season = getSeason(date);
    const slotType = isHpOrHcSlot(date, hpHcMapping);

    seasonData[season].total += item.value;

    if (slotType === "HP") {
      seasonData[season].HP += item.value / 2;
    } else if (slotType === "HC") {
      seasonData[season].HC += item.value / 2;
    }
  }

  return Object.entries(seasonData).map(([season, data]) => ({
    season: season as Season,
    seasonTotalSum: data.total,
    hpHcData: {
      HP: data.HP,
      HC: data.HC,
    },
  }));
}
