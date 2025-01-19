import { CalculatedData } from "../types";
import { calculatePrices } from "./calculators";

describe("calculateTempoPrices", () => {
  it("RED days 2025-01-10 (previous is white)", async () => {
    const hpRedPrice = 7562;
    const hcRedPrice = 1568;
    const hcWhitePrice = 1486;
    const data: CalculatedData[] = [
      {
        recordedAt: "2025-01-10 02:00:00",
        value: 270,
      },
      {
        recordedAt: "2025-01-10 02:30:00",
        value: 422,
      },
      {
        recordedAt: "2025-01-10 06:00:00",
        value: 100,
      },
      {
        recordedAt: "2025-01-10 06:30:00",
        value: 200,
      },
      {
        recordedAt: "2025-01-10 22:00:00",
        value: 300,
      },
      {
        recordedAt: "2025-01-10 22:30:00",
        value: 400,
      },
      {
        recordedAt: "2025-01-11 01:00:00",
        value: 270,
      },
    ];

    const result = await calculatePrices({
      data,
      optionName: "TEMPO",
      offerType: "BLEU",
    });

    const expected: CalculatedData[] = [
      {
        recordedAt: "2025-01-10 02:00:00",
        value: 270,
        costs: [
          {
            optionName: "TEMPO",
            offerType: "BLEU",
            cost: 270 * hcWhitePrice,
            tempoCodeDay: 2,
            hourType: "HC",
          },
        ],
      },
      {
        recordedAt: "2025-01-10 02:30:00",
        value: 422,
        costs: [
          {
            optionName: "TEMPO",
            offerType: "BLEU",
            cost: 422 * hcWhitePrice,
            tempoCodeDay: 2,
            hourType: "HC",
          },
        ],
      },
      {
        recordedAt: "2025-01-10 06:00:00",
        value: 100,
        costs: [
          {
            optionName: "TEMPO",
            offerType: "BLEU",
            cost: 100 * hcWhitePrice,
            tempoCodeDay: 2,
            hourType: "HC",
          },
        ],
      },
      {
        recordedAt: "2025-01-10 06:30:00",
        value: 200,
        costs: [
          {
            optionName: "TEMPO",
            offerType: "BLEU",
            cost: 200 * hpRedPrice,
            tempoCodeDay: 3,
            hourType: "HP",
          },
        ],
      },
      {
        recordedAt: "2025-01-10 22:00:00",
        value: 300,
        costs: [
          {
            optionName: "TEMPO",
            offerType: "BLEU",
            cost: 300 * hpRedPrice,
            tempoCodeDay: 3,
            hourType: "HP",
          },
        ],
      },
      {
        recordedAt: "2025-01-10 22:30:00",
        value: 400,
        costs: [
          {
            optionName: "TEMPO",
            offerType: "BLEU",
            cost: 400 * hcRedPrice,
            tempoCodeDay: 3,
            hourType: "HC",
          },
        ],
      },
      {
        recordedAt: "2025-01-11 01:00:00",
        value: 270,
        costs: [
          {
            optionName: "TEMPO",
            offerType: "BLEU",
            cost: 270 * hcRedPrice,
            hourType: "HC",
            tempoCodeDay: 3,
          },
        ],
      },
    ];
    expect(result).toEqual(expected);
  });
});

describe("calculateBasePrices", () => {
  it("BLEU", async () => {
    const data: CalculatedData[] = [
      {
        recordedAt: "2025-01-10 02:00:00",
        value: 270,
      },
      {
        recordedAt: "2025-01-10 02:30:00",
        value: 422,
      },
    ];
    const base_price = 2516;

    const result = await calculatePrices({
      data,
      optionName: "BASE",
      offerType: "BLEU",
    });

    const expected: CalculatedData[] = [
      {
        recordedAt: "2025-01-10 02:00:00",
        value: 270,
        costs: [
          { optionName: "BASE", offerType: "BLEU", cost: 270 * base_price },
        ],
      },
      {
        recordedAt: "2025-01-10 02:30:00",
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
  it("should calculate hp hc prices correctly", async () => {
    const data: CalculatedData[] = [
      {
        recordedAt: "2025-01-10 02:00:00",
        value: 270,
      },
      {
        recordedAt: "2025-01-10 02:30:00",
        value: 422,
      },
      {
        recordedAt: "2025-01-10 03:00:00",
        value: 100,
      },
    ];
    const hpPrice = 2700;
    const hcPrice = 2068;

    const result = await calculatePrices({
      data,
      optionName: "HPHC",
      offerType: "BLEU",
    });

    const expected: CalculatedData[] = [
      {
        recordedAt: "2025-01-10 02:00:00",
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
        recordedAt: "2025-01-10 02:30:00",
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
        recordedAt: "2025-01-10 03:00:00",
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
