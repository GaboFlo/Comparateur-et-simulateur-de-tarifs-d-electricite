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
import {
  calculateHpHcSeasonAnalysis,
  calculatePrices,
  getTempoDateKey,
  parseTime,
} from "./calculators";

describe("calculateTempoPrices", () => {
  it("RED days 2025-01-10 (previous is white)", async () => {
    const tempoDates = tempo_data as TempoDates;

    const hpRedPrice = 7060;
    const hcRedPrice = 1575;
    const hcWhitePrice = 1499;
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
    const optionKey = OptionKey.BLEU_TEMPO;
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
      totalCost: 2886229,
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

  const basePrice = 1940;
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
    const hpPrice = 2065;
    const hcPrice = 1579;
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

describe("calculateHpHcSeasonAnalysis", () => {
  const mockHpHcMapping: HpHcSlot[] = hphc_data as HpHcSlot[];

  const createMockData = (
    date: string,
    value: number,
  ): ConsumptionLoadCurveData => ({
    recordedAt: date,
    value,
  });

  it("devrait calculer correctement la répartition HP/HC par saison", () => {
    const mockData: ConsumptionLoadCurveData[] = [
      // Hiver - HP (fin de slot à 8h00 et 8h30)
      createMockData("2024-01-15T08:00:00Z", 100),
      createMockData("2024-01-15T08:30:00Z", 150),
      // Hiver - HC (fin de slot à 3h00 et 3h30)
      createMockData("2024-01-16T03:00:00Z", 80),
      createMockData("2024-01-16T03:30:00Z", 60),

      // Été - HP (fin de slot à 8h00 et 8h30)
      createMockData("2024-07-15T08:00:00Z", 120),
      createMockData("2024-07-15T08:30:00Z", 180),
      // Été - HC (fin de slot à 3h00 et 3h30)
      createMockData("2024-07-16T03:00:00Z", 90),
      createMockData("2024-07-16T03:30:00Z", 70),
    ];

    const result = calculateHpHcSeasonAnalysis(mockData, mockHpHcMapping);

    expect(result).toHaveLength(4);

    const hiver = result.find((r) => r.season === "Hiver");
    const ete = result.find((r) => r.season === "Été");

    expect(hiver).toBeDefined();
    expect(hiver?.hpHcData.HC).toBe(70); // 80+60
    expect(hiver?.hpHcData.HP).toBe(125); // 100+150

    expect(ete).toBeDefined();
    expect(ete?.hpHcData.HP).toBe(150); // 120+180
    expect(ete?.hpHcData.HC).toBe(80); // 90+70
  });

  it("devrait gérer les données vides", () => {
    const result = calculateHpHcSeasonAnalysis([], mockHpHcMapping);

    expect(result).toHaveLength(4);

    result.forEach((season) => {
      expect(season.seasonTotalSum).toBe(0);
      expect(season.hpHcData.HP).toBe(0);
      expect(season.hpHcData.HC).toBe(0);
    });
  });

  it("devrait inclure toutes les saisons même sans données", () => {
    const result = calculateHpHcSeasonAnalysis([], mockHpHcMapping);

    const seasons = result.map((r) => r.season);
    expect(seasons).toContain("Hiver");
    expect(seasons).toContain("Printemps");
    expect(seasons).toContain("Été");
    expect(seasons).toContain("Automne");
  });
});
