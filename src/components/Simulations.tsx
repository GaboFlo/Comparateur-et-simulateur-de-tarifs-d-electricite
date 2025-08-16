import { useMatomo } from "@jonkoops/matomo-tracker-react";
import { Alert, Button, Chip, Divider, Typography } from "@mui/material";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/system";
import { MobileDateRangePicker } from "@mui/x-date-pickers-pro";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../context/FormContext";
import { OfferType, OptionKey } from "../types";

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
  const navigate = useNavigate();

  // Validation des dates pour éviter les erreurs "Invalid time value"
  const validateDateRange = (dateRange: [Date, Date]): [Date, Date] => {
    const [start, end] = dateRange;

    // Vérifier si les dates sont valides
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      // Retourner des dates par défaut si invalides
      const defaultStart = dayjs().subtract(1, "year").startOf("day").toDate();
      const defaultEnd = dayjs().endOf("day").toDate();
      return [defaultStart, defaultEnd];
    }

    return dateRange;
  };

  const safeDateRange = validateDateRange(formState.analyzedDateRange);

  const setRange = (range: [Date, Date]) => {
    setFormState((prevState) => ({
      ...prevState,
      dateRange: range,
      isGlobalLoading: true,
    }));

    if (!formState.parsedData) {
      setFormState((prevState) => ({
        ...prevState,
        isGlobalLoading: false,
      }));
      return;
    }

    if (!formState.parsedData) return;

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

  const handleRestart = () => {
    // Vider le formState en gardant seulement les valeurs par défaut
    setFormState({
      provider: "EDF",
      offerType: OfferType.BLEU,
      optionType: OptionKey.BASE,
      powerClass: 6,
      isGlobalLoading: false,
      analyzedDateRange: [
        new Date(new Date().getFullYear() - 2, 0, 1),
        new Date(),
      ],
      totalConsumption: 1,
      rowSummaries: [],
    });

    // Rediriger vers l'étape 0
    navigate("?step=0");

    trackEvent({ category: "Simulations", action: "Restart" });
  };

  const handleLast6Months = () => {
    const endDate = dayjs().endOf("day").toDate();
    const startDate = dayjs().subtract(6, "month").startOf("day").toDate();

    trackEvent({
      category: "date-range",
      action: "shortcut",
      name: "last-6-months",
    });

    setRange([startDate, endDate]);
  };

  const handleLast12Months = () => {
    const endDate = dayjs().endOf("day").toDate();
    const startDate = dayjs().subtract(1, "year").startOf("day").toDate();

    trackEvent({
      category: "date-range",
      action: "shortcut",
      name: "last-12-months",
    });

    setRange([startDate, endDate]);
  };

  const handleLast24Months = () => {
    const endDate = dayjs().endOf("day").toDate();
    const startDate = dayjs().subtract(2, "year").startOf("day").toDate();

    trackEvent({
      category: "date-range",
      action: "shortcut",
      name: "last-24-months",
    });

    setRange([startDate, endDate]);
  };

  const diffDays = dayjs(safeDateRange[1]).diff(dayjs(safeDateRange[0]), "day");

  return (
    <Stack textAlign={"center"}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <MobileDateRangePicker
          value={[dayjs(safeDateRange[0]), dayjs(safeDateRange[1])]}
          loading={formState.isGlobalLoading}
          onAccept={(newValue) => {
            const start = dayjs(newValue[0] ?? new Date())
              .startOf("day")
              .toDate();
            const end = dayjs(newValue[1] ?? new Date())
              .endOf("day")
              .toDate();
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip
            label="6 derniers mois"
            onClick={handleLast6Months}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "primary.50",
              },
            }}
          />
          <Chip
            label="12 derniers mois"
            onClick={handleLast12Months}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "primary.50",
              },
            }}
          />
          <Chip
            label="24 derniers mois"
            onClick={handleLast24Months}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "primary.50",
              },
            }}
          />
        </Box>
      </Box>
      <Alert severity="info" sx={{ m: 1, textAlign: "justify" }}>
        Vous avez consommé <b>{formatKWhLarge(formState.totalConsumption)} </b>
        sur la période analysée (du{" "}
        {dayjs(safeDateRange[0]).format("DD/MM/YYYY")} au{" "}
        {dayjs(safeDateRange[1]).format("DD/MM/YYYY")}), soit une{" "}
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
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
        <Button variant="contained" color="secondary" onClick={handlePrint}>
          Télécharger
        </Button>
        <Button variant="outlined" color="primary" onClick={handleRestart}>
          Recommencer
        </Button>
      </Box>
    </Stack>
  );
}
