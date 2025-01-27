import {
  HpHcFileMapping,
  OfferType,
  OptionName,
  PowerClass,
} from "../../front/src/types";
import hphc_mapping from "./hp_hc.json";
import {
  findMonthlySubscriptionCost,
  getSeason,
  isFrenchHoliday,
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

describe("isFrenchHoliday", () => {
  it("should return true for a holiday", () => {
    const date = new Date("2025-01-01T05:00:00+02:00");

    expect(isFrenchHoliday(date)).toBe(true);
  });

  it("should return false for a Monday", () => {
    const date = new Date("2023-10-09T00:00:00+02:00");
    expect(isFrenchHoliday(date)).toBe(false);
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
