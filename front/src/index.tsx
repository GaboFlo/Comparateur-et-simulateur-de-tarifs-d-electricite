import { LicenseInfo } from "@mui/x-date-pickers-pro";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import MatomoTracker from "./components/MatomoTracker";
import { FormProvider } from "./context/FormContext";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
LicenseInfo.setLicenseKey(
  "63cdcff003c86a961f1b47b5703dd5e0Tz0wLEU9MjUzNDA0ODY0MDAwMDAwLFM9cHJlbWl1bSxMTT1zdWJzY3JpcHRpb24sS1Y9Mg=="
);

root.render(
  <BrowserRouter>
    <FormProvider>
      <MatomoTracker />
      <App />
    </FormProvider>
  </BrowserRouter>
);
