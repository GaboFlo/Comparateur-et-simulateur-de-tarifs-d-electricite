export type PriceMappingFile = Option[];

export type OptionName =
  | "BASE"
  | "HPHC"
  | "TEMPO"
  | "WEEK_END_HPHC"
  | "FLEX_ECO"
  | "FLEX_SOBRIETE"
  | "WEEK_END_PLUS_LUNDI"
  | "WEEK_END_PLUS_MERCREDI"
  | "WEEK_END_PLUS_VENDREDI"
  | "WEEK_END_PLUS_HPHC_LUNDI"
  | "WEEK_END_PLUS_HPHC_MERCREDI"
  | "WEEK_END_PLUS_HPHC_VENDREDI"
  | "FIXE_BASE"
  | "FIXE_HPHC"
  | "ONLINE_BASE";
export type OfferType = "BLEU" | "ZEN" | "VERT";
export type SlotType = "HP" | "HC";

export interface Option {
  optionName: OptionName;
  offerType: OfferType;
  subscriptions: Subscription[];
  mappings: Mapping[];
  tempoMappings?: TempoMapping[];
}

export interface Subscription {
  powerClass: PowerClass;
  monthlyCost: number;
}

export type PowerClass = 6 | 9 | 12 | 15 | 18 | 24 | 30 | 36;

export interface Mapping {
  applicableDays: number[];
  price?: number;
  hpHcConfig?: HpHcConfigParent[];
  include_holidays?: boolean;
}

export interface HpHcConfigParent {
  slotType: SlotType;
  price: number;
}

export interface HpHCConfig {
  price: number;
  slotName?: OfferType;
}

export interface TempoMapping {
  tempoCodeDay: number;
  HP: number;
  HC: number;
}

export interface ConsumptionLoadCurveData {
  recordedAt: string;
  value: number;
}

export interface CalculatedData extends ConsumptionLoadCurveData {
  costs?: Cost[];
}
export type AvailableOptions = "BLEU_BASE" | "BLEU_HPHC" | "BLEU_TEMPO";
export type DayType = "BLEU" | "BLANC" | "ROUGE";

export interface Cost {
  optionName: OptionName;
  offerType: OfferType;
  cost: number;
  hourType?: SlotType;
  tempoCodeDay?: TempoCodeDay;
}

/* HPHC file */
export type HpHcFile = HpHcFileMapping[];

export interface HpHcFileMapping {
  offerType: OfferType;
  grids: GridMapping[];
}

export interface GridMapping {
  slotType: string;
  endSlot: HourTime;
}

interface HourTime {
  minute: number;
  hour: number;
}

/* Tempo dates API */
export type TempoDates = TempoDate[];

export interface TempoDate {
  dateJour: string;
  codeJour: TempoCodeDay;
  periode: string;
}

export type TempoCodeDay = 1 | 2 | 3;
