import hphc_mapping from "./hp_hc.json";
import price_mapping from "./price_mapping.json";
import {
  CalculatedData,
  Cost,
  HpHcFileMapping,
  Mapping,
  OfferType,
  Option,
  OptionName,
  PriceMappingParent,
} from "./types";
import { isFrenchHoliday, isHpOrHcSlot } from "./utils";

interface CalculateProps {
  data: CalculatedData[];
  optionName: OptionName;
  offerType: OfferType;
}

function isDayApplicable(mapping: Mapping, endOfSlotRecorded: Date): boolean {
  return (
    mapping.applicableDays.includes(endOfSlotRecorded.getDay()) ||
    (mapping.include_holidays && isFrenchHoliday(endOfSlotRecorded))
  );
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
  ).grids;
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

export function calculatePrices({
  data,
  optionName,
  offerType,
}: CalculateProps): CalculatedData[] {
  const priceMappingData = price_mapping as PriceMappingParent;
  const hpHcMappingData = hphc_mapping as HpHcFileMapping[];
  const option = priceMappingData.find(
    (item) => item.optionName === optionName && item.offerType === offerType
  );
  const new_data: CalculatedData[] = [];

  data.forEach((item) => {
    const endOfSlotRecorded = new Date(item.recordedAt);
    const commonThrowError = `${offerType}-${optionName}-${endOfSlotRecorded.toISOString()}`;

    let new_cost: Cost | null = null;

    if (!option || !option.mappings) {
      throw new Error(`No mapping found ${commonThrowError}`);
    }

    for (const singleMapping of option.mappings) {
      if (isDayApplicable(singleMapping, endOfSlotRecorded)) {
        if (singleMapping.hpHcConfig) {
          new_cost = calculateHpHcPrices(
            hpHcMappingData,
            endOfSlotRecorded,
            singleMapping,
            option,
            item
          );
        } else {
          if (!singleMapping.price) {
            throw new Error(`No base price found ${commonThrowError}`);
          }
          new_cost = {
            optionName,
            offerType,
            cost: singleMapping.price * item.value,
          };
        }
      } else {
        throw new Error(
          `No applicableDays found nor include_holidays ${commonThrowError}`
        );
      }
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
