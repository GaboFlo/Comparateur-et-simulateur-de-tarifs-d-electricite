import { calculatePrices } from "./calculators";
import { CalculatedData } from "./types";

describe("calculateBasePrices", () => {
  it("BLEU", () => {
    const data: CalculatedData[] = [
      {
        recordedAt: "2022-03-06 02:00:00",
        value: 270,
      },
      {
        recordedAt: "2022-03-06 02:30:00",
        value: 422,
      },
    ];
    const base_price = 2516;

    const result = calculatePrices({
      data,
      optionName: "BASE",
      offerType: "BLEU",
    });

    const expected: CalculatedData[] = [
      {
        recordedAt: "2022-03-06 02:00:00",
        value: 270,
        costs: [
          { optionName: "BASE", offerType: "BLEU", cost: 270 * base_price },
        ],
      },
      {
        recordedAt: "2022-03-06 02:30:00",
        value: 422,
        costs: [
          { optionName: "BASE", offerType: "BLEU", cost: 422 * base_price },
        ],
      },
    ];
    expect(result).toEqual(expected);
  });
});

describe("calculateHpHcPrices", () => {
  it("should calculate hp hc prices correctly", () => {
    const data: CalculatedData[] = [
      {
        recordedAt: "2022-03-06 02:00:00",
        value: 270,
      },
      {
        recordedAt: "2022-03-06 02:30:00",
        value: 422,
      },
      {
        recordedAt: "2022-03-06 03:00:00",
        value: 100,
      },
    ];
    const hpPrice = 2700;
    const hcPrice = 2068;

    const result = calculatePrices({
      data,
      optionName: "HPHC",
      offerType: "BLEU",
    });

    const expected: CalculatedData[] = [
      {
        recordedAt: "2022-03-06 02:00:00",
        value: 270,
        costs: [
          {
            optionName: "HPHC",
            offerType: "BLEU",
            cost: 270 * hpPrice,
            hourType: "HP",
          },
        ],
      },
      {
        recordedAt: "2022-03-06 02:30:00",
        value: 422,
        costs: [
          {
            optionName: "HPHC",
            offerType: "BLEU",
            cost: 422 * hpPrice,
            hourType: "HP",
          },
        ],
      },
      {
        recordedAt: "2022-03-06 03:00:00",
        value: 100,
        costs: [
          {
            optionName: "HPHC",
            offerType: "BLEU",
            cost: 100 * hcPrice,
            hourType: "HC",
          },
        ],
      },
    ];
    expect(result).toEqual(expected);
  });
});
