export interface PriceMapping {
  category: string;
  options: Options[];
}

export interface Options {
  name: string;
  abonnements: Abonnements[];
  mapping?: Mapping[];
  tempoMapping?: TempoMapping[];
}

export interface TempoMapping {
  tempo_day: number;
  HP: number;
  HC: number;
}

export interface Abonnements {
  puissance: number;
  mensuel: number;
}

export interface Mapping {
  days_of_week: number[];
  price?: number;
  hp_hc_config?: HpHcConfig;
}

export enum HPHC_SLOT_TYPE {
  BLEU = "BLEU",
  ZEN = "ZEN",
}

export interface HpHcConfig {
  hp: {
    price: number;
    slots: HPHC_SLOT_TYPE;
  };
  hc: {
    price: number;
    slots: HPHC_SLOT_TYPE;
  };
}
