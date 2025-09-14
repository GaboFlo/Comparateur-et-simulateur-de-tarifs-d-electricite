import dayjs from "dayjs";
import React, { createContext, ReactNode, useMemo, useState } from "react";
import {
  ComparisonTableInterfaceRow,
  ConsumptionLoadCurveData,
  HpHcSlot,
  OfferType,
  OptionKey,
  PowerClass,
  ProviderType,
  SeasonHourlyAnalysis,
} from "../types";

interface FormState {
  provider: ProviderType;
  offerType: OfferType;
  optionType: OptionKey | "";
  powerClass: PowerClass;
  isGlobalLoading: boolean;
  seasonHourlyAnalysis?: SeasonHourlyAnalysis[];
  analyzedDateRange: [Date, Date];
  requestId?: string;
  optionLink?: string;
  totalConsumption: number;
  hpHcConfig?: HpHcSlot[];
  parsedData?: ConsumptionLoadCurveData[];
  rowSummaries: ComparisonTableInterfaceRow[];
}

interface FormContextProps {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

interface FormProviderProps {
  children: ReactNode;
}

const FormContext = createContext<FormContextProps | undefined>(undefined);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    console.warn("useFormContext must be used within a FormProvider");
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};

export const DEFAULT_FORM_STATE: FormState = {
  provider: "EDF",
  offerType: OfferType.BLEU,
  optionType: OptionKey.BASE,
  powerClass: 6,
  isGlobalLoading: false,
  analyzedDateRange: [
    dayjs().subtract(2, "year").startOf("day").toDate(),
    dayjs().endOf("day").toDate(),
  ],
  totalConsumption: 1,
  rowSummaries: [],
};

// Fonction utilitaire pour valider et convertir les dates
const parseDateRange = (dateRange: unknown): [Date, Date] => {
  if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) {
    return DEFAULT_FORM_STATE.analyzedDateRange;
  }

  try {
    return [
      new Date(dateRange[0] || Date.now()),
      new Date(dateRange[1] || Date.now()),
    ];
  } catch (dateError) {
    console.warn("Erreur lors de la conversion des dates:", dateError);
    return DEFAULT_FORM_STATE.analyzedDateRange;
  }
};

// Fonction utilitaire pour créer l'état sérialisable
const createSerializableState = (nextState: FormState) => ({
  provider: nextState.provider,
  offerType: nextState.offerType,
  optionType: nextState.optionType,
  powerClass: nextState.powerClass,
  isGlobalLoading: nextState.isGlobalLoading,
  requestId: nextState.requestId,
  optionLink: nextState.optionLink,
  totalConsumption: nextState.totalConsumption,
  analyzedDateRange: nextState.analyzedDateRange
    ? [
        nextState.analyzedDateRange[0]?.toISOString(),
        nextState.analyzedDateRange[1]?.toISOString(),
      ]
    : undefined,
});

// Fonction utilitaire pour sauvegarder l'état
const saveStateToStorage = (
  serializableState: ReturnType<typeof createSerializableState>
) => {
  try {
    localStorage.setItem("formState", JSON.stringify(serializableState));
  } catch (error) {
    console.warn("Impossible de sauvegarder l'état:", error);
  }
};

// Fonction utilitaire pour restaurer l'état depuis localStorage
const restoreStateFromStorage = (): FormState => {
  try {
    const saved = localStorage.getItem("formState");
    if (!saved) {
      return DEFAULT_FORM_STATE;
    }

    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_FORM_STATE;
    }

    const analyzedDateRange = parseDateRange(parsed.analyzedDateRange);

    return {
      ...DEFAULT_FORM_STATE,
      provider: parsed.provider || DEFAULT_FORM_STATE.provider,
      offerType: parsed.offerType || DEFAULT_FORM_STATE.offerType,
      optionType: parsed.optionType || DEFAULT_FORM_STATE.optionType,
      powerClass: parsed.powerClass || DEFAULT_FORM_STATE.powerClass,
      isGlobalLoading:
        parsed.isGlobalLoading || DEFAULT_FORM_STATE.isGlobalLoading,
      requestId: parsed.requestId,
      optionLink: parsed.optionLink,
      totalConsumption:
        parsed.totalConsumption || DEFAULT_FORM_STATE.totalConsumption,
      analyzedDateRange,
    };
  } catch (error) {
    console.warn("Erreur lors du chargement du state:", error);
    return DEFAULT_FORM_STATE;
  }
};

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [formState, setFormState] = useState<FormState>(
    restoreStateFromStorage
  );

  const setFormStateWithPersistence = React.useCallback(
    (newState: FormState | ((prev: FormState) => FormState)) => {
      setFormState((prevState) => {
        const nextState =
          typeof newState === "function" ? newState(prevState) : newState;

        const serializableState = createSerializableState(nextState);
        saveStateToStorage(serializableState);

        return nextState;
      });
    },
    []
  );

  const contextValue = useMemo(
    () => ({ formState, setFormState: setFormStateWithPersistence }),
    [formState, setFormStateWithPersistence]
  );

  return (
    <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>
  );
};
