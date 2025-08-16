import { ThemeProvider } from "@mui/material/styles";
import { LicenseInfo } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { SnackbarProvider } from "notistack";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { FormProvider } from "./context/FormContext";
import { MatomoContextProvider } from "./context/MatomoContext";
import "./dayjs-config";
import "./index.css";
import { Theme } from "./theme/myTheme";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

LicenseInfo.setLicenseKey(
  "63cdcff003c86a961f1b47b5703dd5e0Tz0wLEU9MjUzNDA0ODY0MDAwMDAwLFM9cHJlbWl1bSxMTT1zdWJzY3JpcHRpb24sS1Y9Mg=="
);

root.render(
  <BrowserRouter>
    <MatomoContextProvider>
      <SnackbarProvider autoHideDuration={2000} preventDuplicate>
        <FormProvider>
          <ThemeProvider theme={Theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
              <App />
            </LocalizationProvider>
          </ThemeProvider>
        </FormProvider>
      </SnackbarProvider>
    </MatomoContextProvider>
  </BrowserRouter>
);
