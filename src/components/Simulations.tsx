import { useMatomo } from "@jonkoops/matomo-tracker-react";
import { Alert, Button, Divider, Typography } from "@mui/material";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/system";
import { MobileDateRangePicker } from "@mui/x-date-pickers-pro";
import { differenceInDays, endOfDay, format, startOfDay } from "date-fns";
import { useFormContext } from "../context/FormContext";
import { analyseHourByHourBySeason } from "../scripts/statistics";
import { formatKWhLarge } from "../scripts/utils";
import { ComparisonTable } from "./ComparisonTable";
import HourlySeasonChart from "./HourlySeasonChart";
import HpHcSeasonChart from "./HpHcSeasonChart";
import HpHcSlotSelector from "./HpHcSelector";

export default function Simulations() {
  const { formState, setFormState } = useFormContext();
  const { trackEvent } = useMatomo();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const setRange = (range: [Date, Date]) => {
    setFormState((prevState) => ({
      ...prevState,
      dateRange: range,
      isGlobalLoading: true,
    }));
    if (!formState.parsedData) {
      return;
    }
    const seasonData = analyseHourByHourBySeason({
      data: formState.parsedData,
      dateRange: range,
    });
    const totalConsumption = seasonData.reduce(
      (acc, cur) => acc + cur.seasonTotalSum,
      0
    );

    setFormState((prevState) => ({
      ...prevState,
      seasonHourlyAnalysis: seasonData,
      analyzedDateRange: range,
      totalConsumption: totalConsumption,
      isGlobalLoading: false,
    }));
  };

  const handlePrint = () => {
    window.print();
    trackEvent({ category: "Simulations", action: "Print" });
  };

  const diffDays = differenceInDays(
    new Date(formState.analyzedDateRange[1]),
    new Date(formState.analyzedDateRange[0])
  );

  return (
    <Stack textAlign={"center"}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <MobileDateRangePicker
          value={[
            new Date(formState.analyzedDateRange[0]),
            new Date(formState.analyzedDateRange[1]),
          ]}
          loading={formState.isGlobalLoading}
          onAccept={(newValue) => {
            const start = startOfDay(newValue[0] ?? new Date());
            const end = endOfDay(newValue[1] ?? new Date());
            trackEvent({
              category: "date-range",
              action: "set",
              name: `${Math.ceil(
                Math.abs(new Date(end).getTime() - new Date(start).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}`,
            });
            setRange([start, end]);
          }}
          disableFuture
          localeText={{
            start: "Début de simulation",
            end: "Fin de simulation",
            cancelButtonLabel: "Annuler",
            toolbarTitle: "",
          }}
        />
      </Box>
      <Alert severity="info" sx={{ m: 1, textAlign: "justify" }}>
        Vous avez consommé <b>{formatKWhLarge(formState.totalConsumption)} </b>
        sur la période analysée (du{" "}
        {format(formState.analyzedDateRange[0], "dd/MM/yyyy")} au{" "}
        {format(formState.analyzedDateRange[1], "dd/MM/yyyy")}), soit une{" "}
        <b>
          moyenne de {formatKWhLarge(formState.totalConsumption / diffDays)} par
          jour
        </b>{" "}
      </Alert>
      <HourlySeasonChart />
      <Divider sx={{ marginX: 2, mt: 2 }} />
      <HpHcSeasonChart />
      <Divider sx={{ marginX: 2, mt: 2 }} />
      <Typography variant="h5" sx={{ mt: 2 }}>
        Combien auriez-vous gagné en changeant d'offre ?
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Les prix (TTC) sont <b>simulés</b> en fonction de votre consommation que
        vous venez d'importer, sur la même période. <br />
        Ils peuvent différer de vos factures car la simulation est réalisée sur
        la base des tarifs actuels des fournisseurs.
      </Typography>
      <ComparisonTable />
      {isDesktop && <HpHcSlotSelector readOnly />}
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
