import { ThemeProvider } from "@mui/material/styles";
import { LicenseInfo } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { fr } from "date-fns/locale/fr";
import { SnackbarProvider } from "notistack";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import ModernApp from "./ModernApp";
import { FormProvider } from "./context/FormContext";
import { MatomoContextProvider } from "./context/MatomoContext";
import "./index.css";
import { modernTheme } from "./theme/modernTheme";

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
          <ThemeProvider theme={modernTheme}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={fr}
            >
              <ModernApp />
            </LocalizationProvider>
          </ThemeProvider>
        </FormProvider>
      </SnackbarProvider>
    </MatomoContextProvider>
  </BrowserRouter>
);
