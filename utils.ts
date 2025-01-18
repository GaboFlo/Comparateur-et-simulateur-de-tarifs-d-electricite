import { isSaturday, isSunday } from "date-fns";
import Holidays from "date-holidays";
import { GridMapping, SlotType } from "./types";

export const costConverter = 10000000;
export const abonnementConverter = 100;

const hd = new Holidays("FR");
export function isWeekendOrHoliday(date: Date): boolean {
  if (isSaturday(date) || isSunday(date)) {
    return true;
  }

  const holiday = hd.isHoliday(date);
  if (holiday) {
    return true;
  }

  return false;
}

export function isFrenchHoliday(date: Date): boolean {
  return Boolean(hd.isHoliday(date));
}

export const isHpOrHcSlot = (
  endOfRecordedPeriod: Date,
  grids: GridMapping[]
) => {
  return grids.find((elt) => {
    return (
      elt.endSlot.hour === endOfRecordedPeriod.getHours() &&
      elt.endSlot.minute === endOfRecordedPeriod.getMinutes()
    );
  }).slotType as SlotType;
};
