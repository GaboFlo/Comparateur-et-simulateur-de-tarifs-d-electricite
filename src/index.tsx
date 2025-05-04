import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { LicenseInfo } from "@mui/x-license";
import { fr } from "date-fns/locale/fr";
import { SnackbarProvider } from "notistack";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { FormProvider } from "./context/FormContext";
import { MatomoContextProvider } from "./context/MatomoContext";
import "./index.css";
import AppTheme from "./theme/AppTheme";

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
          <AppTheme>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={fr}
            >
              <App />
            </LocalizationProvider>
          </AppTheme>
        </FormProvider>
      </SnackbarProvider>
    </MatomoContextProvider>
  </BrowserRouter>
);
