import {
  ConsumptionLoadCurveData,
  parseCsvToConsumptionLoadCurveData,
  parseEnedisCsvToConsumptionLoadCurveData,
} from "./csvParser";

describe("parseCsvToConsumptionLoadCurveData", () => {
  it("should parse a single day of data correctly", () => {
    const csvString = `R飡pitulatif de mes puissances atteintes en W

Date et heure de rel趥 par le distributeur;Puissance atteinte (W);Nature de la donn饊
18/01/2025;;
00:00:00;1122;R饬le
23:30:00;1184;R饬le
03:30:00;964;R饬le
03:00:00;760;R饬le
02:30:00;854;R饬le
02:40:00;1314;R饬le
01:30:00;942;R饬le
01:00:00;1160;R饬le
00:30:00;1102;R饬le

17/01/2025;;
00:00:00;1356;R饬le
23:30:00;914;R饬le

16/01/2025;;
00:00:00;1568;R饬le
23:30:00;2436;R饬le
23:00:00;920;R饬le
06:30:00;578;R饬le
06:00:00;758;R饬le
05:30:00;1100;R饬le
05:00:00;758;R饬le
04:30:00;908;R饬le
04:00:00;1330;R饬le
03:30:00;742;R饬le
03:00:00;1088;R饬le
02:30:00;764;R饬le
02:00:00;982;R饬le
01:30:00;1098;R饬le
01:00:00;1442;R饬le
00:30:00;2660;R饬le
`;

    const expectedData: ConsumptionLoadCurveData[] = [
      {
        recordedAt: "2025-01-18T00:00:00+01:00",
        value: 1122,
      },
      {
        recordedAt: "2025-01-18T23:30:00+01:00",
        value: 1184,
      },
      {
        recordedAt: "2025-01-18T03:30:00+01:00",
        value: 964,
      },
      {
        recordedAt: "2025-01-18T03:00:00+01:00",
        value: 760,
      },
      {
        recordedAt: "2025-01-18T02:30:00+01:00",
        value: 854,
      },
      {
        recordedAt: "2025-01-18T01:30:00+01:00",
        value: 942,
      },
      {
        recordedAt: "2025-01-18T01:00:00+01:00",
        value: 1160,
      },
      {
        recordedAt: "2025-01-18T00:30:00+01:00",
        value: 1102,
      },
      {
        recordedAt: "2025-01-17T00:00:00+01:00",
        value: 1356,
      },
      {
        recordedAt: "2025-01-17T23:30:00+01:00",
        value: 914,
      },
      {
        recordedAt: "2025-01-16T00:00:00+01:00",
        value: 1568,
      },
      {
        recordedAt: "2025-01-16T23:30:00+01:00",
        value: 2436,
      },
      {
        recordedAt: "2025-01-16T23:00:00+01:00",
        value: 920,
      },
      {
        recordedAt: "2025-01-16T06:30:00+01:00",
        value: 578,
      },
      {
        recordedAt: "2025-01-16T06:00:00+01:00",
        value: 758,
      },
      {
        recordedAt: "2025-01-16T05:30:00+01:00",
        value: 1100,
      },
      {
        recordedAt: "2025-01-16T05:00:00+01:00",
        value: 758,
      },
      {
        recordedAt: "2025-01-16T04:30:00+01:00",
        value: 908,
      },
      {
        recordedAt: "2025-01-16T04:00:00+01:00",
        value: 1330,
      },
      {
        recordedAt: "2025-01-16T03:30:00+01:00",
        value: 742,
      },
      {
        recordedAt: "2025-01-16T03:00:00+01:00",
        value: 1088,
      },
      {
        recordedAt: "2025-01-16T02:30:00+01:00",
        value: 764,
      },
      {
        recordedAt: "2025-01-16T02:00:00+01:00",
        value: 982,
      },
      {
        recordedAt: "2025-01-16T01:30:00+01:00",
        value: 1098,
      },
      {
        recordedAt: "2025-01-16T01:00:00+01:00",
        value: 1442,
      },
      {
        recordedAt: "2025-01-16T00:30:00+01:00",
        value: 2660,
      },
    ];

    const result = parseCsvToConsumptionLoadCurveData(csvString);
    expect(result).toEqual(expectedData);
  });
});

describe("parseEnedisCsvToConsumptionLoadCurveData", () => {
  it("should parse valid Enedis CSV data correctly", () => {
    const csvString = `debut;fin;kW
2023-12-12T00:00;2023-12-12T00:30;"0,696"
2023-12-12T00:30;2023-12-12T01:00;"0,28"
2023-12-12T01:00;2023-12-12T01:30;"0,656"
`;

    const result = parseEnedisCsvToConsumptionLoadCurveData(csvString);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      recordedAt: expect.stringMatching(/^2023-12-12T00:00:00/),
      value: 696,
    });
    expect(result[1]).toEqual({
      recordedAt: expect.stringMatching(/^2023-12-12T00:30:00/),
      value: 280,
    });
    expect(result[2]).toEqual({
      recordedAt: expect.stringMatching(/^2023-12-12T01:00:00/),
      value: 656,
    });
  });

  it("should convert kWh to Wh correctly", () => {
    const csvString = `debut;fin;kW
2023-12-12T00:00;2023-12-12T00:30;"1,5"
2023-12-12T00:30;2023-12-12T01:00;"0,123"`;

    const result = parseEnedisCsvToConsumptionLoadCurveData(csvString);

    expect(result[0].value).toBe(1500);
    expect(result[1].value).toBe(123);
  });

  it("should handle values without quotes", () => {
    const csvString = `debut;fin;kW
2023-12-12T00:00;2023-12-12T00:30;0,696
2023-12-12T00:30;2023-12-12T01:00;0,28`;

    const result = parseEnedisCsvToConsumptionLoadCurveData(csvString);

    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(696);
    expect(result[1].value).toBe(280);
  });

  it("should ignore empty lines", () => {
    const csvString = `debut;fin;kW

2023-12-12T00:00;2023-12-12T00:30;"0,696"

2023-12-12T00:30;2023-12-12T01:00;"0,28"
`;

    const result = parseEnedisCsvToConsumptionLoadCurveData(csvString);

    expect(result).toHaveLength(2);
  });

  it("should ignore lines with invalid date format", () => {
    const csvString = `debut;fin;kW
2023-12-12T00:00;2023-12-12T00:30;"0,696"
invalid-date;2023-12-12T01:00;"0,28"
2023-12-12T01:00;2023-12-12T01:30;"0,656"`;

    const result = parseEnedisCsvToConsumptionLoadCurveData(csvString);

    expect(result).toHaveLength(2);
  });

  it("should ignore lines with dates not at 0 or 30 minutes", () => {
    const csvString = `debut;fin;kW
2023-12-12T00:00;2023-12-12T00:30;"0,696"
2023-12-12T00:15;2023-12-12T00:45;"0,28"
2023-12-12T01:00;2023-12-12T01:30;"0,656"`;

    const result = parseEnedisCsvToConsumptionLoadCurveData(csvString);

    expect(result).toHaveLength(2);
  });

  it("should ignore lines with invalid numeric values", () => {
    const csvString = `debut;fin;kW
2023-12-12T00:00;2023-12-12T00:30;"0,696"
2023-12-12T00:30;2023-12-12T01:00;"invalid"
2023-12-12T01:00;2023-12-12T01:30;"-1,5"
2023-12-12T01:30;2023-12-12T02:00;"0,656"`;

    const result = parseEnedisCsvToConsumptionLoadCurveData(csvString);

    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(696);
    expect(result[1].value).toBe(656);
  });

  it("should ignore lines with missing columns", () => {
    const csvString = `debut;fin;kW
2023-12-12T00:00;2023-12-12T00:30;"0,696"
2023-12-12T00:30;"0,28"
2023-12-12T01:00;2023-12-12T01:30;"0,656"`;

    const result = parseEnedisCsvToConsumptionLoadCurveData(csvString);

    expect(result).toHaveLength(2);
  });

  it("should throw error for empty file", () => {
    const csvString = "";

    expect(() => {
      parseEnedisCsvToConsumptionLoadCurveData(csvString);
    }).toThrow("Données CSV invalides");
  });

  it("should throw error for file with only header", () => {
    const csvString = "debut;fin;kW";

    expect(() => {
      parseEnedisCsvToConsumptionLoadCurveData(csvString);
    }).toThrow("Le fichier CSV Enedis est vide ou invalide");
  });

  it("should throw error for invalid header", () => {
    const csvString = `date;time;value
2023-12-12T00:00;2023-12-12T00:30;"0,696"`;

    expect(() => {
      parseEnedisCsvToConsumptionLoadCurveData(csvString);
    }).toThrow(
      "Le format du fichier CSV Enedis est invalide. Colonnes attendues : debut;fin;kW"
    );
  });

  it("should throw error when no valid data is found", () => {
    const csvString = `debut;fin;kW
invalid-date;invalid-date;"invalid"`;

    expect(() => {
      parseEnedisCsvToConsumptionLoadCurveData(csvString);
    }).toThrow("Aucune donnée valide trouvée dans le fichier CSV Enedis");
  });

  it("should handle header with different case", () => {
    const csvString = `DEBUT;FIN;KW
2023-12-12T00:00;2023-12-12T00:30;"0,696"`;

    const result = parseEnedisCsvToConsumptionLoadCurveData(csvString);

    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(696);
  });

  it("should handle large values correctly", () => {
    const csvString = `debut;fin;kW
2023-12-12T00:00;2023-12-12T00:30;"123,456"`;

    const result = parseEnedisCsvToConsumptionLoadCurveData(csvString);

    expect(result[0].value).toBe(123456);
  });
});
