import { useMatomo } from "@jonkoops/matomo-tracker-react";
import { Button, Divider, Typography } from "@mui/material";
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
  return (
    <Stack textAlign={"center"}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Selon votre consommation du{" "}
        {formState.analyzedDateRange
          ? format(formState.analyzedDateRange[0], "dd/MM/yyyy")
          : format(formState.dateRange[0], "dd/MM/yyyy")}{" "}
        au{" "}
        {formState.analyzedDateRange
          ? format(formState.analyzedDateRange[1], "dd/MM/yyyy")
          : format(formState.dateRange[1], "dd/MM/yyyy")}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {new Intl.NumberFormat("fr-FR").format(formState.totalConsumption)} kWh{" "}
      </Typography>
      <HourlySeasonChart />
      <Divider sx={{ marginX: 2, mt: 2 }} />
      <Typography variant="h5" sx={{ mt: 2 }}>
        Comparaison des offres <br /> Combien auriez-vous gagné en changeant
        d'offre ?
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Les prix sont calculés en fonction de votre consommation que vous venez
        d'importer, sur la même période.
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
