import { useMatomo } from "@jonkoops/matomo-tracker-react";
import { Alert, Button, Divider, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { format } from "date-fns";
import { useFormContext } from "../context/FormContext";
import { ComparisonTable } from "./ComparisonTable";
import HourlySeasonChart from "./HourlySeasonChart";
import HpHcSlotSelector from "./HpHcSelector";

export default function Simulations() {
  const { formState } = useFormContext();
  const { trackEvent } = useMatomo();
  const handlePrint = () => {
    window.print();
    trackEvent({ category: "Simulations", action: "Print" });
  };
  const realAnalyzedDateRange = formState.analyzedDateRange
    ? formState.analyzedDateRange
    : [formState.dateRange[0].getTime(), formState.dateRange[1].getTime()];

  const diffDays = Math.ceil(
    (realAnalyzedDateRange[1] - realAnalyzedDateRange[0]) / (1000 * 3600 * 24)
  );
  return (
    <Stack textAlign={"center"}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Selon votre consommation du{" "}
        {format(realAnalyzedDateRange[0], "dd/MM/yyyy")} au{" "}
        {format(realAnalyzedDateRange[1], "dd/MM/yyyy")}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <Alert severity="info" sx={{ m: 1, textAlign: "justify" }}>
          Vous avez consommé{" "}
          {new Intl.NumberFormat("fr-FR").format(formState.totalConsumption)}{" "}
          kWh sur la période. Soit une{" "}
          <b>
            moyenne de{" "}
            {new Intl.NumberFormat("fr-FR", {
              maximumFractionDigits: 1,
            }).format(formState.totalConsumption / diffDays)}{" "}
            kWh par jour
          </b>
          .
        </Alert>
      </Typography>
      <HourlySeasonChart />
      <Divider sx={{ marginX: 2, mt: 2 }} />
      <Typography variant="h5" sx={{ mt: 2 }}>
        Combien auriez-vous gagné en changeant d'offre ?
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Les prix sont <b>simulés</b> en fonction de votre consommation que vous
        venez d'importer, sur la même période.
      </Typography>
      <ComparisonTable />
      <HpHcSlotSelector readOnly />
      <Button
        variant="contained"
        color="secondary"
        onClick={handlePrint}
        sx={{ m: 2 }}
      >
        Télécharger
      </Button>
    </Stack>
  );
}
