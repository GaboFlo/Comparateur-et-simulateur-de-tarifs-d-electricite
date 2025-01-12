export type PriceMappingParent = Option[];

export interface Option {
  name: string;
  abonnements: Abonnement[];
  mapping?: Mapping[];
  tempoMapping?: TempoMapping[];
}

export interface Abonnement {
  puissance: number;
  mensuel: number;
}

export interface Mapping {
  price?: number;
  applicableDays: number[];
  hpHcConfig?: HpHcConfigParent;
  include_holidays?: boolean;
}

export interface HpHcConfigParent {
  hp: HpHCConfig;
  hc: HpHCConfig;
}

export interface HpHCConfig {
  price: number;
  slots?: string;
}

export interface TempoMapping {
  tempo_day: number;
  HEURES_PLEINES: number;
  HEURES_CREUSES: number;
}

export interface ConsumptionLoadCurveData {
  recordedAt: string;
  value: number;
}

export interface CalculatedData extends ConsumptionLoadCurveData {
  costs?: Cost[];
}
export type AvailableOptions = "BLEU_BASE" | "BLEU_HPHC" | "BLEU_TEMPO";

export interface Cost {
  name: AvailableOptions;
  cost: number;
}
