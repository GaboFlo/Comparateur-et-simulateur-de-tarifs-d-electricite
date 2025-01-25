import { CalculatedData } from "../types";
import { analyseHourByHourBySeason } from "./statistics";

describe("analyseHourByHourBySeason", () => {
  it("should return the correct data", () => {
    const data: CalculatedData[] = [
      {
        recordedAt: "2025-01-10 02:00:00",
        value: 400,
      },
      {
        recordedAt: "2025-01-10 20:00:00",
        value: 600,
      },
      {
        recordedAt: "2024-04-10 02:00:00",
        value: 100,
      },
      {
        recordedAt: "2024-04-10 08:00:00",
        value: 200,
      },
      {
        recordedAt: "2024-08-18 06:00:00",
        value: 25,
      },
      {
        recordedAt: "2024-11-10 06:30:00",
        value: 75,
      },
    ];
    const result = analyseHourByHourBySeason({
      data,
      dateRange: [new Date("2020-01-10"), new Date("2025-01-11")],
    });
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result));

    const expected = [
      {
        season: "Printemps",
        hourlyPercentages: [
          { hour: "02", value: 0.05, percentage: 33.3 },
          { hour: "08", value: 0.1, percentage: 66.7 },
        ],
      },
      {
        season: "Été",
        hourlyPercentages: [{ hour: "06", value: 0.0125, percentage: 100 }],
      },
      {
        season: "Automne",
        hourlyPercentages: [{ hour: "06", value: 0.0375, percentage: 100 }],
      },
      {
        season: "Hiver",
        hourlyPercentages: [
          { hour: "02", value: 0.2, percentage: 40 },
          { hour: "20", value: 0.3, percentage: 60 },
        ],
      },
    ];

    expect(result).toEqual(expected);
  });
});
