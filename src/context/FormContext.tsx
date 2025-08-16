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
        // Convertir les dates string en objets Date
        if (parsed.analyzedDateRange) {
          parsed.analyzedDateRange = [
            new Date(parsed.analyzedDateRange[0]),
            new Date(parsed.analyzedDateRange[1]),
          ];
        }
        return { ...DEFAULT_FORM_STATE, ...parsed };
      }
    } catch (error) {
      console.error("Erreur lors du chargement du state:", error);
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
          localStorage.setItem("formState", JSON.stringify(nextState));
        } catch (error) {
          console.error("Erreur lors de la sauvegarde du state:", error);
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
