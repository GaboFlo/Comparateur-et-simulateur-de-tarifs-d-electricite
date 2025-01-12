import { calculateBasePrices } from "./calculators";
import { CalculatedData } from "./types";

describe("calculateBasePrices", () => {
  it("should calculate base prices correctly", () => {
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
    const base_price = 1932;

    const result = calculateBasePrices({
      data,
      base_price,
      option: "BLEU_BASE",
    });

    const expected: CalculatedData[] = [
      {
        recordedAt: "2022-03-06 02:00:00",
        value: 270,
        costs: [{ name: "BLEU_BASE", cost: 270 * base_price }],
      },
      {
        recordedAt: "2022-03-06 02:30:00",
        value: 422,
        costs: [{ name: "BLEU_BASE", cost: 422 * base_price }],
      },
    ];
    expect(result).toEqual(expected);

    const second_base_price = 1000;
    const secondResult = calculateBasePrices({
      data: result,
      base_price: second_base_price,
      option: "BLEU_TEMPO",
    });
    const secondExpected: CalculatedData[] = [
      {
        recordedAt: "2022-03-06 02:00:00",
        value: 270,
        costs: [
          { name: "BLEU_BASE", cost: 270 * base_price },
          { name: "BLEU_TEMPO", cost: 270 * second_base_price },
        ],
      },
      {
        recordedAt: "2022-03-06 02:30:00",
        value: 422,
        costs: [
          { name: "BLEU_BASE", cost: 422 * base_price },
          { name: "BLEU_TEMPO", cost: 422 * second_base_price },
        ],
      },
    ];
    expect(secondResult).toEqual(secondExpected);
  });
});
