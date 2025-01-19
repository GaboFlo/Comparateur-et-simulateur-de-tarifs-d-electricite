import Holidays from "date-holidays";
import { GridMapping, SlotType } from "../types";

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
