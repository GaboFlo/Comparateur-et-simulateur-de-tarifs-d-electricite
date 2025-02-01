import { endOfDay, startOfDay, subYears } from "date-fns";
import React, { createContext, ReactNode, useContext, useState } from "react";
import {
  OfferType,
  OptionName,
  PowerClass,
  PriceMappingFile,
  SeasonHourlyAnalysis,
} from "../types";

type AvailableSuppliers = "EDF";

export type ImportMode = "files" | "api";
interface FormState {
  allOffers?: PriceMappingFile;
  supplier: AvailableSuppliers;
  offerType: OfferType;
  optionType: OptionName | "";
  powerClass: PowerClass;
  isGlobalLoading: boolean;
  seasonHourlyAnalysis?: SeasonHourlyAnalysis[];
  dateRange: [Date, Date];
  analyzedDateRange?: [Date, Date];
  fileId?: string;
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
  const lastYearStart = startOfDay(subYears(new Date(), 1));
  const lastYearEnd = endOfDay(new Date());
  const [formState, setFormState] = useState<FormState>({
    supplier: "EDF",
    offerType: OfferType.BLEU,
    optionType: OptionName.BASE,
    powerClass: 6,
    isGlobalLoading: false,
    dateRange: [lastYearStart, lastYearEnd],
  });

  return (
    <FormContext.Provider value={{ formState, setFormState }}>
      {children}
    </FormContext.Provider>
  );
};
