import hphc_mapping from "../statics/hp_hc.json";
import { HpHcFileMapping, OfferType, OptionName, PowerClass } from "./types";
import {
  findFirstAndLastDate,
  findMonthlySubscriptionCost,
  getHolidaysBetweenDates,
  getSeason,
  isHoliday,
  isHpOrHcSlot,
} from "./utils";

describe("isHpOrHcSlot", () => {
  const hphcMapping = hphc_mapping as HpHcFileMapping[];
  const blueGrids = hphcMapping.find((elt) =>
    elt.offerType.includes(OfferType.BLEU)
  );
  if (!blueGrids) {
    throw new Error("No blue grids found");
  }

  const testMapping = [
    { endOfTimeSlot: "00:00", expected: "HP" },
    { endOfTimeSlot: "00:30", expected: "HP" },
    { endOfTimeSlot: "01:00", expected: "HP" },
    { endOfTimeSlot: "01:30", expected: "HP" },
    { endOfTimeSlot: "02:00", expected: "HP" },
    { endOfTimeSlot: "02:30", expected: "HP" },
    { endOfTimeSlot: "03:00", expected: "HC" },
    { endOfTimeSlot: "03:30", expected: "HC" },
    { endOfTimeSlot: "04:00", expected: "HC" },
    { endOfTimeSlot: "04:30", expected: "HC" },
    { endOfTimeSlot: "05:00", expected: "HC" },
    { endOfTimeSlot: "05:30", expected: "HC" },
    { endOfTimeSlot: "06:00", expected: "HC" },
    { endOfTimeSlot: "06:30", expected: "HC" },
    { endOfTimeSlot: "07:00", expected: "HC" },
    { endOfTimeSlot: "07:30", expected: "HC" },
    { endOfTimeSlot: "08:00", expected: "HP" },
    { endOfTimeSlot: "08:30", expected: "HP" },
    { endOfTimeSlot: "09:00", expected: "HP" },
    { endOfTimeSlot: "09:30", expected: "HP" },
    { endOfTimeSlot: "10:00", expected: "HP" },
    { endOfTimeSlot: "10:30", expected: "HP" },
    { endOfTimeSlot: "11:00", expected: "HP" },
    { endOfTimeSlot: "11:30", expected: "HP" },
    { endOfTimeSlot: "12:00", expected: "HP" },
    { endOfTimeSlot: "12:30", expected: "HP" },
    { endOfTimeSlot: "13:00", expected: "HP" },
    { endOfTimeSlot: "13:30", expected: "HP" },
    { endOfTimeSlot: "14:00", expected: "HC" },
    { endOfTimeSlot: "14:30", expected: "HC" },
    { endOfTimeSlot: "15:00", expected: "HC" },
    { endOfTimeSlot: "15:30", expected: "HC" },
    { endOfTimeSlot: "16:00", expected: "HC" },
    { endOfTimeSlot: "16:30", expected: "HC" },
    { endOfTimeSlot: "17:00", expected: "HP" },
    { endOfTimeSlot: "17:30", expected: "HP" },
    { endOfTimeSlot: "18:00", expected: "HP" },
    { endOfTimeSlot: "18:30", expected: "HP" },
    { endOfTimeSlot: "19:00", expected: "HP" },
    { endOfTimeSlot: "19:30", expected: "HP" },
    { endOfTimeSlot: "20:00", expected: "HP" },
    { endOfTimeSlot: "20:30", expected: "HP" },
    { endOfTimeSlot: "21:00", expected: "HP" },
    { endOfTimeSlot: "21:30", expected: "HP" },
    { endOfTimeSlot: "22:00", expected: "HP" },
    { endOfTimeSlot: "22:30", expected: "HP" },
    { endOfTimeSlot: "23:00", expected: "HP" },
    { endOfTimeSlot: "23:30", expected: "HP" },
  ];
  testMapping.forEach(({ endOfTimeSlot, expected }) => {
    it(endOfTimeSlot, () => {
      const date = new Date(`2023-10-10T${endOfTimeSlot}:00+02:00`);
      const slotType = isHpOrHcSlot(date, blueGrids.grids);
      expect(slotType).toBe(expected);
    });
  });
});

describe("getSeason", () => {
  it("should return Hiver for December 23st", () => {
    const date = new Date("2023-12-21T00:00:00+02:00");
    expect(getSeason(date)).toBe("Hiver");
  });

  it("should return Hiver for January 1st", () => {
    const date = new Date("2023-01-01T00:00:00+02:00");
    expect(getSeason(date)).toBe("Hiver");
  });

  it("should return Printemps for March 21st", () => {
    const date = new Date("2023-03-25T00:00:00+02:00");
    expect(getSeason(date)).toBe("Printemps");
  });

  it("should return Été for June 21st", () => {
    const date = new Date("2023-06-21T00:00:00+02:00");
    expect(getSeason(date)).toBe("Été");
  });

  it("should return Automne for September 21st", () => {
    const date = new Date("2023-09-21T00:00:00+02:00");
    expect(getSeason(date)).toBe("Automne");
  });
});

describe("findMonthlySubscriptionCost", () => {
  it("BASE BLEU 9", () => {
    const monthly = findMonthlySubscriptionCost(
      9 as PowerClass,
      OfferType.BLEU,
      OptionName.BASE
    );
    expect(monthly).toBe(1589);
  });
});

describe("findFirstAndLastDate", () => {
  it("findFirstAndLastDate", () => {
    const data = [
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
    expect(findFirstAndLastDate(data)).toStrictEqual([
      new Date("2025-01-10T01:00:00.000Z").getTime(),
      new Date("2025-01-11").getTime(),
    ]);
  });
});
describe("Holidays", () => {
  const holidays = getHolidaysBetweenDates([
    new Date("2024-12-01"),
    new Date("2025-05-31"),
  ]);
  it("getHolidaysBetweenDates", () => {
    expect(holidays).toEqual([
      "2024-12-25",
      "2025-01-01",
      "2025-04-21",
      "2025-05-01",
      "2025-05-08",
      "2025-05-25",
      "2025-05-29",
    ]);
  });
  it("isHoliday", () => {
    expect(isHoliday(new Date("2025-01-01 00:00:00"))).toBe(false);
    expect(isHoliday(new Date("2025-01-01 02:30:00"))).toBe(true);
    expect(isHoliday(new Date("2025-01-01 23:30:00"))).toBe(true);
    expect(isHoliday(new Date("2025-01-02 00:00:00"))).toBe(true);
  });
});
