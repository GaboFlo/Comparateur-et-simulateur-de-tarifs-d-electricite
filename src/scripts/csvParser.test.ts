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
  it("should parse a single day of data correctly - suspicious bug", () => {
    const csvString = `R飡pitulatif de mes puissances atteintes en W

Date et heure de rel趥 par le distributeur;Puissance atteinte (W);Nature de la donn饊
07/11/2025;;
00:00:00;588;R饬le
23:30:00;420;R饬le
23:00:00;1840;R饬le
22:30:00;1084;R饬le
22:00:00;754;R饬le
21:30:00;936;R饬le
21:00:00;2100;R饬le
20:30:00;336;R饬le
20:00:00;410;R饬le
19:30:00;612;R饬le
19:00:00;394;R饬le
18:30:00;352;R饬le
18:00:00;670;R饬le
17:30:00;378;R饬le
17:00:00;426;R饬le
16:30:00;332;R饬le
16:00:00;324;R饬le
15:30:00;364;R饬le
15:00:00;488;R饬le
14:30:00;438;R饬le
14:00:00;680;R饬le
13:30:00;438;R饬le
13:00:00;468;R饬le
12:30:00;318;R饬le
12:00:00;724;R饬le
11:30:00;466;R饬le
11:00:00;348;R饬le
10:30:00;524;R饬le
10:00:00;680;R饬le
09:30:00;376;R饬le
09:00:00;802;R饬le
08:30:00;936;R饬le
08:00:00;332;R饬le
07:30:00;824;R饬le
07:00:00;68;R饬le
06:30:00;56;R饬le
06:00:00;146;R饬le
05:30:00;68;R饬le
05:00:00;150;R饬le
04:30:00;328;R饬le
04:00:00;68;R饬le
03:30:00;148;R饬le
03:00:00;68;R饬le
02:30:00;62;R饬le
02:00:00;100;R饬le
01:30:00;334;R饬le
01:00:00;68;R饬le
00:30:00;72;R饬le
`;

    const expectedData: ConsumptionLoadCurveData[] = [
      {
        recordedAt: "2025-11-07T00:00:00+01:00",
        value: 588,
      },
      {
        recordedAt: "2025-11-07T23:30:00+01:00",
        value: 420,
      },
      {
        recordedAt: "2025-11-07T23:00:00+01:00",
        value: 1840,
      },
      {
        recordedAt: "2025-11-07T22:30:00+01:00",
        value: 1084,
      },
      {
        recordedAt: "2025-11-07T22:00:00+01:00",
        value: 754,
      },
      {
        recordedAt: "2025-11-07T21:30:00+01:00",
        value: 936,
      },
      {
        recordedAt: "2025-11-07T21:00:00+01:00",
        value: 2100,
      },
      {
        recordedAt: "2025-11-07T20:30:00+01:00",
        value: 336,
      },
      {
        recordedAt: "2025-11-07T20:00:00+01:00",
        value: 410,
      },
      {
        recordedAt: "2025-11-07T19:30:00+01:00",
        value: 612,
      },
      {
        recordedAt: "2025-11-07T19:00:00+01:00",
        value: 394,
      },
      {
        recordedAt: "2025-11-07T18:30:00+01:00",
        value: 352,
      },
      {
        recordedAt: "2025-11-07T18:00:00+01:00",
        value: 670,
      },
      {
        recordedAt: "2025-11-07T17:30:00+01:00",
        value: 378,
      },
      {
        recordedAt: "2025-11-07T17:00:00+01:00",
        value: 426,
      },
      {
        recordedAt: "2025-11-07T16:30:00+01:00",
        value: 332,
      },
      {
        recordedAt: "2025-11-07T16:00:00+01:00",
        value: 324,
      },
      {
        recordedAt: "2025-11-07T15:30:00+01:00",
        value: 364,
      },
      {
        recordedAt: "2025-11-07T15:00:00+01:00",
        value: 488,
      },
      {
        recordedAt: "2025-11-07T14:30:00+01:00",
        value: 438,
      },
      {
        recordedAt: "2025-11-07T14:00:00+01:00",
        value: 680,
      },
      {
        recordedAt: "2025-11-07T13:30:00+01:00",
        value: 438,
      },
      {
        recordedAt: "2025-11-07T13:00:00+01:00",
        value: 468,
      },
      {
        recordedAt: "2025-11-07T12:30:00+01:00",
        value: 318,
      },
      {
        recordedAt: "2025-11-07T12:00:00+01:00",
        value: 724,
      },
      {
        recordedAt: "2025-11-07T11:30:00+01:00",
        value: 466,
      },
      {
        recordedAt: "2025-11-07T11:00:00+01:00",
        value: 348,
      },
      {
        recordedAt: "2025-11-07T10:30:00+01:00",
        value: 524,
      },
      {
        recordedAt: "2025-11-07T10:00:00+01:00",
        value: 680,
      },
      {
        recordedAt: "2025-11-07T09:30:00+01:00",
        value: 376,
      },
      {
        recordedAt: "2025-11-07T09:00:00+01:00",
        value: 802,
      },
      {
        recordedAt: "2025-11-07T08:30:00+01:00",
        value: 936,
      },
      {
        recordedAt: "2025-11-07T08:00:00+01:00",
        value: 332,
      },
      {
        recordedAt: "2025-11-07T07:30:00+01:00",
        value: 824,
      },
      {
        recordedAt: "2025-11-07T07:00:00+01:00",
        value: 68,
      },
      {
        recordedAt: "2025-11-07T06:30:00+01:00",
        value: 56,
      },
      {
        recordedAt: "2025-11-07T06:00:00+01:00",
        value: 146,
      },
      {
        recordedAt: "2025-11-07T05:30:00+01:00",
        value: 68,
      },
      {
        recordedAt: "2025-11-07T05:00:00+01:00",
        value: 150,
      },
      {
        recordedAt: "2025-11-07T04:30:00+01:00",
        value: 328,
      },
      {
        recordedAt: "2025-11-07T04:00:00+01:00",
        value: 68,
      },
      {
        recordedAt: "2025-11-07T03:30:00+01:00",
        value: 148,
      },
      {
        recordedAt: "2025-11-07T03:00:00+01:00",
        value: 68,
      },
      {
        recordedAt: "2025-11-07T02:30:00+01:00",
        value: 62,
      },
      {
        recordedAt: "2025-11-07T02:00:00+01:00",
        value: 100,
      },
      {
        recordedAt: "2025-11-07T01:30:00+01:00",
        value: 334,
      },
      {
        recordedAt: "2025-11-07T01:00:00+01:00",
        value: 68,
      },
      {
        recordedAt: "2025-11-07T00:30:00+01:00",
        value: 72,
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
