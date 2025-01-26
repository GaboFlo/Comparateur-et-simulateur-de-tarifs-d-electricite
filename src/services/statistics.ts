import { Season } from "../types";
import { getSeason } from "./utils";

interface SeasonHourlyAnalysis {
  season: Season;
  seasonTotalSum: number;
  hourly: { hour: string; value: number }[];
}

interface HourlyAnalysis {
  [hour: string]: number;
}

interface ConsumptionLoadCurveData {
  recordedAt: string;
  value: number;
}

interface Props {
  data: ConsumptionLoadCurveData[];
  dateRange: [Date, Date];
}
export const analyseHourByHourBySeason = ({
  data,
  dateRange,
}: Props): SeasonHourlyAnalysis[] => {
  const seasons: Record<Season, HourlyAnalysis> = {
    Printemps: {},
    Été: {},
    Automne: {},
    Hiver: {},
  };

  data
    .filter((record) => {
      const date = new Date(record.recordedAt);
      return date >= dateRange[0] && date <= dateRange[1];
    })
    .forEach((record) => {
      const date = new Date(record.recordedAt);
      const hour = date.getHours().toString().padStart(2, "0");

      const season = getSeason(date);

      if (!seasons[season][hour]) {
        seasons[season][hour] = 0;
      }
      /* Divides by 1000 for kWh and /2 as half-hour*/
      seasons[season][hour] += record.value / 1000 / 2;
    });

  const seasonHourlys: SeasonHourlyAnalysis[] = [];

  for (const season in seasons) {
    const seasonData = seasons[season as keyof typeof seasons];
    let seasonTotalSum = 0;

    for (const hour in seasonData) {
      seasonTotalSum += seasonData[hour];
    }

    const seasonHourlysArray: {
      hour: string;
      value: number;
    }[] = [];

    for (const hour in seasonData) {
      seasonHourlysArray.push({
        hour: hour,
        value: seasonData[hour],
      });
    }

    seasonHourlys.push({
      season: season as Season,
      seasonTotalSum: Math.round(seasonTotalSum),
      hourly: seasonHourlysArray.sort((a, b) => a.hour.localeCompare(b.hour)),
    });
  }

  return seasonHourlys;
};
