import { isSaturday, isSunday } from "date-fns";
import Holidays from "date-holidays";
import { AvailableOptions, CalculatedData } from "./types";

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
