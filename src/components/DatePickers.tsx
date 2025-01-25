import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { Alert } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { MobileDateRangePicker } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { endOfDay, startOfDay } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { useFormContext } from "../context/FormContext";

export default function DatePickers() {
  const { formState, setFormState } = useFormContext();

  const setRange = (range: [Date, Date]) => {
    setFormState((prevState) => ({
      ...prevState,
      dateRange: range,
    }));
  };

  return (
    <Stack spacing={{ xs: 3, sm: 3 }} useFlexGap>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Alert
          severity="info"
          icon={<InfoRoundedIcon />}
          variant="outlined"
          sx={{
            alignItems: "center",
            width: "100%",
            marginBottom: 2,
          }}
        >
          Vous pouvez réduire la période d'analyse de vos données (si vous avez
          eu un changement récent dans vos modes de consommation, ...)
        </Alert>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <MobileDateRangePicker
            value={formState.dateRange}
            onAccept={(newValue) => {
              const start = startOfDay(newValue[0] ?? new Date());
              const end = endOfDay(newValue[1] ?? new Date());
              setRange([start, end]);
            }}
            disableFuture
            localeText={{
              start: "Début",
              end: "Fin",
              cancelButtonLabel: "Annuler",
              toolbarTitle: "",
            }}
            minDate={formState.dateRange[0]}
            maxDate={formState.dateRange[1]}
          />
        </LocalizationProvider>
      </Box>
    </Stack>
  );
}
