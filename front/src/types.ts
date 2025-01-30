export type PriceMappingFile = Option[];

export enum OptionName {
  BASE = "BASE",
  HPHC = "HPHC",
  TEMPO = "TEMPO",
  WEEK_END_HPHC = "WEEK_END_HPHC",
  FLEX_ECO = "FLEX_ECO",
  FLEX_SOBRIETE = "FLEX_SOBRIETE",
  WEEK_END_PLUS_LUNDI = "WEEK_END_PLUS_LUNDI",
  WEEK_END_PLUS_MERCREDI = "WEEK_END_PLUS_MERCREDI",
  WEEK_END_PLUS_VENDREDI = "WEEK_END_PLUS_VENDREDI",
  WEEK_END_PLUS_HPHC_LUNDI = "WEEK_END_PLUS_HPHC_LUNDI",
  WEEK_END_PLUS_HPHC_MERCREDI = "WEEK_END_PLUS_HPHC_MERCREDI",
  WEEK_END_PLUS_HPHC_VENDREDI = "WEEK_END_PLUS_HPHC_VENDREDI",
  FIXE_BASE = "FIXE_BASE",
  FIXE_HPHC = "FIXE_HPHC",
  ONLINE_BASE = "ONLINE_BASE",
}

export enum OfferType {
  BLEU = "BLEU",
  ZEN = "ZEN",
  VERT = "VERT",
}
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

export interface TempoMapping {
  tempoCodeDay: number;
  HP: number;
  HC: number;
}

export interface ConsumptionLoadCurveData {
  recordedAt: string;
  value: number;
}

export interface FullCalculatedData {
  detailedData: CalculatedData[];
  totalCost: number;
  optionName: OptionName;
  offerType: OfferType;
}
export interface CalculatedData extends ConsumptionLoadCurveData {
  costs?: Cost[];
}

export interface Cost {
  cost: number;
  hourType?: SlotType;
  tempoCodeDay?: TempoCodeDay;
}

/* HPHC file */
export type HpHcFile = HpHcFileMapping[];

export interface HpHcFileMapping {
  offerType: OfferType[];
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

export type Season = "Été" | "Hiver" | "Automne" | "Printemps";

export interface ComparisonTableInterfaceRow {
  provider: "EDF";
  offerType: OfferType;
  optionName: OptionName;
  totalConsumptionCost: number;
  monthlyCost: number;
  total: number;
}

export interface SeasonHourlyAnalysis {
  season: Season;
  seasonTotalSum: number;
  hourly: { hour: string; value: number }[];
}
