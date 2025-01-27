import { Box, Stack } from "@mui/system";
import { MobileDateRangePicker } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { endOfDay, startOfDay } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { useEffect } from "react";
import { useFormContext } from "../context/FormContext";

export default function DatePickers() {
  const { formState, setFormState } = useFormContext();
  if (!formState.fileDateRange) {
    return null;
  }

  const setRange = (range: [Date, Date]) => {
    setFormState((prevState) => ({
      ...prevState,
      dateRange: range,
    }));
  };

  useEffect(() => {
    setFormState((prevState) => ({
      ...prevState,
      dateRange: formState.fileDateRange,
    }));
  }, []);

  return (
    <Stack spacing={{ xs: 3, sm: 3 }} useFlexGap>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <MobileDateRangePicker
            value={formState.dateRange ?? formState.fileDateRange}
            onAccept={(newValue) => {
              const start = startOfDay(newValue[0] ?? new Date());
              const end = endOfDay(newValue[1] ?? new Date());
              setRange([start, end]);
            }}
            disableFuture
            localeText={{
              start: "Début de simulation",
              end: "Fin de simulation",
              cancelButtonLabel: "Annuler",
              toolbarTitle: "",
            }}
            minDate={formState.fileDateRange[0]}
            maxDate={formState.fileDateRange[1]}
          />
        </LocalizationProvider>
      </Box>
    </Stack>
  );
}
