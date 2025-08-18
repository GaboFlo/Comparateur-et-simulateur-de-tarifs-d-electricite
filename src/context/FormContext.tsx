import dayjs from "dayjs";
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
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

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  // Récupérer l'état initial depuis localStorage ou utiliser les valeurs par défaut
  const getInitialState = (): FormState => {
    try {
      const saved = localStorage.getItem("formState");
      if (saved) {
        const parsed = JSON.parse(saved);

        // Vérifier que parsed est un objet valide
        if (!parsed || typeof parsed !== "object") {
          return DEFAULT_FORM_STATE;
        }

        // Convertir les dates string en objets Date
        let analyzedDateRange = DEFAULT_FORM_STATE.analyzedDateRange;
        if (
          parsed.analyzedDateRange &&
          Array.isArray(parsed.analyzedDateRange) &&
          parsed.analyzedDateRange.length === 2
        ) {
          try {
            analyzedDateRange = [
              new Date(parsed.analyzedDateRange[0] || Date.now()),
              new Date(parsed.analyzedDateRange[1] || Date.now()),
            ];
          } catch (dateError) {
            console.warn("Erreur lors de la conversion des dates:", dateError);
          }
        }

        // Ne restaurer que les propriétés primitives valides
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
      }
    } catch (error) {
      console.warn("Erreur lors du chargement du state:", error);
    }
    return DEFAULT_FORM_STATE;
  };

  const [formState, setFormState] = useState<FormState>(getInitialState);

  // Sauvegarder dans localStorage à chaque changement
  const setFormStateWithPersistence = React.useCallback(
    (newState: FormState | ((prev: FormState) => FormState)) => {
      setFormState((prevState) => {
        const nextState =
          typeof newState === "function" ? newState(prevState) : newState;

        try {
          // Créer une copie sérialisable de l'état en ne gardant que les propriétés primitives
          const serializableState = {
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
          };
          localStorage.setItem("formState", JSON.stringify(serializableState));
        } catch (error) {
          // En cas d'erreur, ne pas sauvegarder plutôt que de planter
          console.warn("Impossible de sauvegarder l'état:", error);
        }
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
