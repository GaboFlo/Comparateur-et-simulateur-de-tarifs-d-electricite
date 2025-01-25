import { subYears } from "date-fns";
import React, { createContext, ReactNode, useContext, useState } from "react";
import {
  ConsumptionLoadCurveData,
  OfferType,
  OptionName,
  PowerClass,
} from "../types";

type AvailableSuppliers = "EDF";

export type ImportMode = "files" | "api";
interface FormState {
  supplier: AvailableSuppliers;
  offerType: OfferType;
  optionType: OptionName | "";
  powerClass: PowerClass;
  importMode: ImportMode;
  prmNumber?: number;
  dateRange: [Date, Date];
  consumptionData: ConsumptionLoadCurveData[];
  disableNext: boolean;
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

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [formState, setFormState] = useState<FormState>({
    supplier: "EDF",
    offerType: "BLEU",
    optionType: "BASE",
    powerClass: 6,
    importMode: "files",
    dateRange: [subYears(new Date(), 1), new Date()],
    consumptionData: [],
    disableNext: false,
  });

  return (
    <FormContext.Provider value={{ formState, setFormState }}>
      {children}
    </FormContext.Provider>
  );
};
