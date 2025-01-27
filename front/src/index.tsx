import { LicenseInfo } from "@mui/x-date-pickers-pro";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { FormProvider } from "./context/FormContext";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
LicenseInfo.setLicenseKey(
  "63cdcff003c86a961f1b47b5703dd5e0Tz0wLEU9MjUzNDA0ODY0MDAwMDAwLFM9cHJlbWl1bSxMTT1zdWJzY3JpcHRpb24sS1Y9Mg=="
);

root.render(
  <React.StrictMode>
    <FormProvider>
      <App />
    </FormProvider>
  </React.StrictMode>
);
