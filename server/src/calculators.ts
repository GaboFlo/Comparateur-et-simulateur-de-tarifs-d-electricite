import { differenceInMonths, format, subDays } from "date-fns";
import hphc_mapping from "../statics/hp_hc.json";
import price_mapping from "../statics/price_mapping.json";
import tempo_file from "../statics/tempo.json";
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
  OptionName,
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
  optionName: OptionName;
  offerType: OfferType;
  tempoDates?: TempoDates;
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
    option.optionName
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
  /* Améliorer les perfs */

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
    cost: (item.value * relevantCost) / 2,
    hourType: slotType,
    tempoCodeDay,
  };
}

export async function calculatePrices({
  data,
  optionName,
  offerType,
}: CalculateProps): Promise<FullCalculatedData> {
  const priceMappingData = price_mapping as PriceMappingFile;
  const hpHcMappingData = hphc_mapping as HpHcFile;
  const option = priceMappingData.find(
    (item) => item.optionName === optionName && item.offerType === offerType
  );
  if (!option) {
    throw new Error(`No option found ${offerType}-${optionName}`);
  }

  const new_data: CalculatedData[] = [];
  let totalCost = 0;

  for (const item of data) {
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
      const tempoDates = tempo_file as TempoDates;
      new_cost = calculateTempoPrices(tempoDates, item, option.tempoMappings);
    }

    if (new_cost) {
      totalCost = totalCost + new_cost.cost;
      new_data.push({
        ...item,
        costs: [...(item.costs ?? []), new_cost],
      });
    } else {
      throw new Error(`No new_cost found ${commonThrowError}`);
    }
  }

  return { detailedData: new_data, totalCost, offerType, optionName };
}

interface FullCalculatePricesInterface {
  data: ConsumptionLoadCurveData[];
  powerClass: PowerClass;
  dateRange: [Date, Date];
  optionName: OptionName;
  offerType: OfferType;
}

export async function calculateRowSummary({
  data,
  powerClass,
  dateRange,
  optionName,
  offerType,
}: FullCalculatePricesInterface) {
  const now = new Date();

  const calculatedData = await calculatePrices({
    data,
    offerType,
    optionName,
  });

  const monthlyCost = findMonthlySubscriptionCost(
    powerClass,
    offerType,
    optionName
  );

  return {
    provider: "EDF",
    offerType,
    optionName,
    totalConsumptionCost: Math.round(calculatedData.totalCost / PRICE_COEFF),
    monthlyCost: monthlyCost / 100,
    total: Math.round(
      calculatedData.totalCost / PRICE_COEFF +
        (monthlyCost * differenceInMonths(dateRange[1], dateRange[0])) / 100
    ),
    computeTime: new Date().getTime() - now.getTime(),
  } as ComparisonTableInterfaceRow;
}
