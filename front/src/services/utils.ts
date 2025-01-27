import { ConsumptionLoadCurveData } from "../types";

export const findFirstAndLastDate = (
  data: ConsumptionLoadCurveData[]
): [Date, Date] => {
  const dates = data.map((item) => new Date(item.recordedAt)?.getTime());
  const firstDate = new Date(Math.min(...dates));
  const lastDate = new Date(Math.max(...dates));
  return [firstDate, lastDate];
};
