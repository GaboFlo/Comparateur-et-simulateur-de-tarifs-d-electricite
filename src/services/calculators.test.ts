import {
  CalculatedData,
  ConsumptionLoadCurveData,
  OfferType,
  OptionName,
} from "../types";
import { calculatePrices, fetchTempoData } from "./calculators";

describe("calculateTempoPrices", () => {
  it("RED days 2025-01-10 (previous is white)", async () => {
    const tempoDates = await fetchTempoData();

    const hpRedPrice = 7562;
    const hcRedPrice = 1568;
    const hcWhitePrice = 1486;
    const data: ConsumptionLoadCurveData[] = [
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

    const result = calculatePrices({
      data,
      optionName: OptionName.TEMPO,
      offerType: OfferType.BLEU,
      tempoDates,
    });

    const expected: CalculatedData[] = [
      {
        recordedAt: "2025-01-10 02:00:00",
        value: 270,
        costs: [
          {
            optionName: OptionName.TEMPO,
            offerType: OfferType.BLEU,
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
            optionName: OptionName.TEMPO,
            offerType: OfferType.BLEU,
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
            optionName: OptionName.TEMPO,
            offerType: OfferType.BLEU,
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
            optionName: OptionName.TEMPO,
            offerType: OfferType.BLEU,
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
            optionName: OptionName.TEMPO,
            offerType: OfferType.BLEU,
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
            optionName: OptionName.TEMPO,
            offerType: OfferType.BLEU,
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
            optionName: OptionName.TEMPO,
            offerType: OfferType.BLEU,
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
  const data: ConsumptionLoadCurveData[] = [
    {
      recordedAt: "2025-01-15 02:00:00",
      value: 270,
    },
    {
      recordedAt: "2025-01-10 02:30:00",
      value: 422,
    },
  ];
  const basePrice = 2516;
  it(OfferType.BLEU, () => {
    const result = calculatePrices({
      data,
      optionName: OptionName.BASE,
      offerType: OfferType.BLEU,
    });

    const expected: CalculatedData[] = [
      {
        recordedAt: "2025-01-15 02:00:00",
        value: 270,
        costs: [
          {
            optionName: OptionName.BASE,
            offerType: OfferType.BLEU,
            cost: 270 * basePrice,
          },
        ],
      },
      {
        recordedAt: "2025-01-10 02:30:00",
        value: 422,
        costs: [
          {
            optionName: OptionName.BASE,
            offerType: OfferType.BLEU,
            cost: 422 * basePrice,
          },
        ],
      },
    ];
    expect(result).toEqual(expected);
  });
  it(`${OfferType.BLEU} filtered`, () => {
    const expectedFiltered: CalculatedData[] = [
      {
        recordedAt: "2025-01-10 02:30:00",
        value: 422,
        costs: [
          {
            optionName: OptionName.BASE,
            offerType: OfferType.BLEU,
            cost: 422 * basePrice,
          },
        ],
      },
    ];

    const resultFilterd = calculatePrices({
      data,
      optionName: OptionName.BASE,
      offerType: OfferType.BLEU,
      dateRange: [new Date("2025-01-01"), new Date("2025-01-10")],
    });
    expect(resultFilterd).toEqual(expectedFiltered);
  });
});

describe("calculateHpHcPrices", () => {
  it("should calculate hp hc prices correctly", () => {
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

    const result = calculatePrices({
      data,
      optionName: OptionName.HPHC,
      offerType: OfferType.BLEU,
    });

    const expected: CalculatedData[] = [
      {
        recordedAt: "2025-01-10 02:00:00",
        value: 270,
        costs: [
          {
            optionName: OptionName.HPHC,
            offerType: OfferType.BLEU,
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
            optionName: OptionName.HPHC,
            offerType: OfferType.BLEU,
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
            optionName: OptionName.HPHC,
            offerType: OfferType.BLEU,
            cost: 100 * hcPrice,
            hourType: "HC",
          },
        ],
      },
    ];
    expect(result).toEqual(expected);
  });
});
