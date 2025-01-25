import { getSeason } from "./utils";

interface SeasonHourlyPercentageAnalysis {
  season: string;
  hourlyPercentages: { hour: string; value: number; percentage: number }[];
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
}: Props): SeasonHourlyPercentageAnalysis[] => {
  const seasons: Record<string, HourlyAnalysis> = {
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

  const seasonHourlyPercentages: SeasonHourlyPercentageAnalysis[] = [];

  for (const season in seasons) {
    const seasonData = seasons[season as keyof typeof seasons];
    let seasonTotalSum = 0;

    for (const hour in seasonData) {
      seasonTotalSum += seasonData[hour];
    }

    const seasonHourlyPercentagesArray: {
      hour: string;
      value: number;
      percentage: number;
    }[] = [];

    for (const hour in seasonData) {
      seasonHourlyPercentagesArray.push({
        hour: hour,
        value: seasonData[hour],
        percentage: parseFloat(
          ((seasonData[hour] / seasonTotalSum) * 100).toFixed(1)
        ),
      });
    }

    seasonHourlyPercentages.push({
      season: season,
      hourlyPercentages: seasonHourlyPercentagesArray.sort(
        (a, b) => parseInt(a.hour) - parseInt(b.hour)
      ),
    });
  }

  return seasonHourlyPercentages;
};
