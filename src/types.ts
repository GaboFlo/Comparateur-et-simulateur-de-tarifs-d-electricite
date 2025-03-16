export enum OptionKey {
  BASE = "BASE",
  HPHC = "HPHC",
  BLEU_TEMPO = "BLEU_TEMPO",
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

export type Season = "Été" | "Hiver" | "Automne" | "Printemps";
export type PowerClass = 6 | 9 | 12 | 15 | 18 | 24 | 30 | 36;

export interface SeasonHourlyAnalysis {
  season: Season;
  seasonTotalSum: number;
  hourly: { hour: string; value: number }[];
}

export type PriceMappingFile = Option[];

export interface TempoMapping {
  tempoCodeDay: number;
  HP: number;
  HC: number;
}
export type SlotType = "HP" | "HC";
export interface HpHcConfigParent {
  slotType: SlotType;
  price: number;
}

export interface Mapping {
  applicableDays: number[];
  price?: number;
  hpHcConfig?: HpHcConfigParent[];
  include_holidays?: boolean;
}

export type ProviderType = "EDF" | "TotalEnergies" | "Engie" | "OctopusEnergy";

export interface Option {
  optionKey: OptionKey;
  provider: ProviderType;
  optionName: string;
  link: string;
  offerType: OfferType;
  subscriptions: Subscription[];
  mappings: Mapping[];
  tempoMappings?: TempoMapping[];
  overridingHpHcKey?: OverridingHpHcKey;
}
export interface Subscription {
  powerClass: PowerClass;
  monthlyCost: number;
}

export interface ComparisonTableInterfaceRow {
  provider: ProviderType;
  offerType: OfferType;
  optionKey: OptionKey;
  optionName: string;
  totalConsumptionCost: number;
  fullSubscriptionCost: number;
  total: number;
  link: string;
  overridingHpHcKey?: OverridingHpHcKey;
}

export const APP_VERSION = process.env.REACT_APP_VERSION ?? "dev";

export interface HourTime {
  hour: number;
  minute: number;
}

export interface HpHcSlot {
  slotType: SlotType;
  startSlot: HourTime;
  endSlot: HourTime;
}

export type TempoDates = TempoDate[];

export interface TempoDate {
  dateJour: string;
  codeJour: TempoCodeDay;
  periode: string;
}

export type TempoCodeDay = 1 | 2 | 3;

export interface Cost {
  cost: number;
  hourType?: SlotType;
  tempoCodeDay?: TempoCodeDay;
}

export interface CalculatedData extends ConsumptionLoadCurveData {
  costs?: Cost[];
}

export interface ConsumptionLoadCurveData {
  recordedAt: string;
  value: number;
}

export interface FullCalculatedData {
  detailedData: CalculatedData[];
  totalCost: number;
  optionKey: OptionKey;
  offerType: OfferType;
}

export type OverridingHpHcKey = "BLEU_TEMPO" | "ZEN_FLEX";
