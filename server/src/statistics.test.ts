import { analyseHourByHourBySeason } from "./statistics";
import { CalculatedData } from "./types";

describe("analyseHourByHourBySeason", () => {
  it("should return the correct data", () => {
    const data: CalculatedData[] = [
      {
        recordedAt: "2025-01-10 02:00:00",
        value: 4000,
      },
      {
        recordedAt: "2025-01-10 20:00:00",
        value: 6000,
      },
      {
        recordedAt: "2024-04-10 02:00:00",
        value: 1000,
      },
      {
        recordedAt: "2024-04-10 08:00:00",
        value: 2000,
      },
      {
        recordedAt: "2024-08-18 06:00:00",
        value: 250,
      },
      {
        recordedAt: "2024-11-10 06:30:00",
        value: 750,
      },
    ];
    const result = analyseHourByHourBySeason({
      data,
      dateRange: [
        new Date("2020-01-10").getTime(),
        new Date("2025-01-11").getTime(),
      ],
    });

    const expected = [
      {
        season: "Printemps",
        seasonTotalSum: 2,
        hourly: [
          { hour: "02", value: 0.5 },
          { hour: "08", value: 1 },
        ],
      },
      {
        season: "Été",
        seasonTotalSum: 0,
        hourly: [{ hour: "06", value: 0.125 }],
      },
      {
        season: "Automne",
        seasonTotalSum: 0,
        hourly: [{ hour: "06", value: 0.375 }],
      },
      {
        season: "Hiver",
        seasonTotalSum: 5,
        hourly: [
          { hour: "02", value: 2 },
          { hour: "20", value: 3 },
        ],
      },
    ];

    expect(result).toEqual(expected);
  });
});
