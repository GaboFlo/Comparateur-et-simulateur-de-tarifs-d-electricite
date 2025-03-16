import tempo_data from "../assets/tempo.json";
import hphc_data from "../statics/hp_hc.json";
import {
  ConsumptionLoadCurveData,
  FullCalculatedData,
  HpHcSlot,
  OfferType,
  OptionKey,
  TempoDates,
} from "../types";
import { calculatePrices, getTempoDateKey, parseTime } from "./calculators";

describe("calculateTempoPrices", () => {
  it("RED days 2025-01-10 (previous is white)", async () => {
    const tempoDates = tempo_data as TempoDates;

    const hpRedPrice = 6586;
    const hcRedPrice = 1518;
    const hcWhitePrice = 1447;
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
    const optionKey = OptionKey.TEMPO;
    const offerType = OfferType.BLEU;
    const hpHcData = (await hphc_data) as HpHcSlot[];

    const result = await calculatePrices({
      data,
      optionKey,
      offerType,
      provider: "EDF",
      tempoDates,
      hpHcData,
    });

    const expected: FullCalculatedData = {
      detailedData: [
        {
          recordedAt: "2025-01-10 02:00:00",
          value: 270,
          costs: [
            {
              cost: (270 * hcWhitePrice) / 2,
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
              cost: (422 * hcWhitePrice) / 2,
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
              cost: (100 * hcWhitePrice) / 2,
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
              cost: (200 * hpRedPrice) / 2,
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
              cost: (300 * hpRedPrice) / 2,
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
              cost: (400 * hcRedPrice) / 2,
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
              cost: (270 * hcRedPrice) / 2,
              hourType: "HC",
              tempoCodeDay: 3,
            },
          ],
        },
      ],
      totalCost: 2728042,
      optionKey,
      offerType,
    };
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

  const basePrice = 2016;
  const optionKey = OptionKey.BASE;
  const offerType = OfferType.BLEU;
  const hpHcData = hphc_data as HpHcSlot[];

  it(`${OfferType.BLEU}`, async () => {
    const result = await calculatePrices({
      data,
      provider: "EDF",
      optionKey,
      offerType,
      hpHcData,
    });

    const expected: FullCalculatedData = {
      detailedData: [
        {
          recordedAt: "2025-01-15 02:00:00",
          value: 270,
          costs: [
            {
              cost: (270 * basePrice) / 2,
            },
          ],
        },
        {
          recordedAt: "2025-01-10 02:30:00",
          value: 422,
          costs: [
            {
              cost: (422 * basePrice) / 2,
            },
          ],
        },
      ],
      totalCost: (270 * basePrice + 422 * basePrice) / 2,
      offerType,
      optionKey,
    };
    expect(result).toEqual(expected);
  });
});

describe("calculateHpHcPrices", () => {
  it("should calculate hp hc prices correctly", async () => {
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
        recordedAt: "2025-01-10 03:00:00",
        value: 100,
      },
    ];
    const hpPrice = 2146;
    const hcPrice = 1696;
    const optionKey = OptionKey.HPHC;
    const offerType = OfferType.BLEU;
    const hpHcData = hphc_data as HpHcSlot[];

    const result = await calculatePrices({
      data,
      optionKey,
      provider: "EDF",
      offerType,
      hpHcData,
    });

    const expected: FullCalculatedData = {
      totalCost: (270 * hpPrice + 422 * hpPrice + 100 * hcPrice) / 2,
      optionKey,
      offerType,
      detailedData: [
        {
          recordedAt: "2025-01-10 02:00:00",
          value: 270,
          costs: [
            {
              cost: (270 * hpPrice) / 2,
              hourType: "HP",
            },
          ],
        },
        {
          recordedAt: "2025-01-10 02:30:00",
          value: 422,
          costs: [
            {
              cost: (422 * hpPrice) / 2,
              hourType: "HP",
            },
          ],
        },
        {
          recordedAt: "2025-01-10 03:00:00",
          value: 100,
          costs: [
            {
              cost: (100 * hcPrice) / 2,
              hourType: "HC",
            },
          ],
        },
      ],
    };
    expect(result).toEqual(expected);
  });
});

describe("parseTime", () => {
  test("parses a valid ISO string with time", () => {
    expect(parseTime("2023-10-10T14:30:00Z")).toEqual({ hour: 14, minute: 30 });
    expect(parseTime("2023-10-10T00:00:00Z")).toEqual({ hour: 0, minute: 0 });
    expect(parseTime("2023-10-10T23:59:59Z")).toEqual({ hour: 23, minute: 59 });
  });

  test("parses edge cases like midnight and noon", () => {
    expect(parseTime("2023-10-10T00:00:00Z")).toEqual({ hour: 0, minute: 0 });
    expect(parseTime("2023-10-10T12:00:00Z")).toEqual({ hour: 12, minute: 0 });
  });
});

describe("getTempoDateKey", () => {
  test("generates a key for a valid date string", () => {
    expect(getTempoDateKey("2023-10-10T05:00:00+01:00")).toBe("2023-10-09");
    expect(getTempoDateKey("2020-02-29T06:00:00+01:00")).toBe("2020-02-28");
    expect(getTempoDateKey("2021-12-31T15:00:00+01:00")).toBe("2021-12-31");
  });

  test("handles edge cases like leap years and different months", () => {
    expect(getTempoDateKey("2020-03-01")).toBe("2020-02-29"); // Leap year
    expect(getTempoDateKey("2019-02-28T15:00:00+01:00")).toBe("2019-02-28"); // Non-leap year
  });
});
