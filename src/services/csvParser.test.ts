import { ConsumptionLoadCurveData } from "../types";
import { parseCsvToConsumptionLoadCurveData } from "./csvParser";

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
02:00:00;1314;R饬le
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
        recordedAt: "2025-01-18T02:00:00+01:00",
        value: 1314,
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
