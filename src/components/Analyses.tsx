import { useMatomo } from "@jonkoops/matomo-tracker-react";
import {
  AccessTime as AccessTimeIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import { Alert, Box, CircularProgress, Stack } from "@mui/material";
import { MobileDateRangePicker } from "@mui/x-date-pickers-pro";
import dayjs from "dayjs";
import * as React from "react";
import { useFormContext } from "../context/FormContext";
import { analyseHourByHourBySeason } from "../scripts/statistics";
import { formatKWhLarge } from "../scripts/utils";
import { OfferType, OptionKey, SeasonHourlyAnalysis } from "../types";
import FormCard from "./FormCard";
import PeriodChips from "./PeriodChips";

import HourlySeasonChart from "./HourlySeasonChart";
import HpHcSeasonChart from "./HpHcSeasonChart";

interface Props {
  handleNext: () => void;
}

const createDateRangeHandlers = (setRange: (range: [Date, Date]) => void) => ({
  handleLast6Months: () => {
    const endDate = dayjs().endOf("day").toDate();
    const startDate = dayjs().subtract(6, "month").startOf("day").toDate();
    setRange([startDate, endDate]);
  },
  handleLast12Months: () => {
    const endDate = dayjs().endOf("day").toDate();
    const startDate = dayjs().subtract(1, "year").startOf("day").toDate();
    setRange([startDate, endDate]);
  },
  handleLast24Months: () => {
    const endDate = dayjs().endOf("day").toDate();
    const startDate = dayjs().subtract(2, "year").startOf("day").toDate();
    setRange([startDate, endDate]);
  },
});

export default function Analyses({ handleNext }: Readonly<Props>) {
  const { formState, setFormState } = useFormContext();
  const { trackEvent } = useMatomo();

  // Validation des dates pour éviter les erreurs "Invalid time value"
  const validateDateRange = (dateRange: [Date, Date]): [Date, Date] => {
    const [start, end] = dateRange;

    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      const defaultStart = dayjs().subtract(1, "year").startOf("day").toDate();
      const defaultEnd = dayjs().endOf("day").toDate();
      return [defaultStart, defaultEnd];
    }

    return dateRange;
  };

  const safeDateRange = validateDateRange(formState.analyzedDateRange);
  const diffDays = dayjs(safeDateRange[1]).diff(dayjs(safeDateRange[0]), "day");

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

    // Recalculer les analyses avec la nouvelle période
    const seasonData = analyseHourByHourBySeason({
      data: formState.parsedData,
      dateRange: range,
    });
    const totalConsumption = seasonData.reduce(
      (acc: number, cur: SeasonHourlyAnalysis) => acc + cur.seasonTotalSum,
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

  const { handleLast6Months, handleLast12Months, handleLast24Months } =
    createDateRangeHandlers(setRange);

  // Vérifier si les données sont disponibles
  if (
    !formState.seasonHourlyAnalysis ||
    formState.seasonHourlyAnalysis.length === 0
  ) {
    return (
      <Box sx={{ width: "100%" }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Aucune donnée de consommation disponible. Veuillez d'abord importer
          vos données.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={4} sx={{ width: "100%", maxWidth: "100%" }}>
        <FormCard
          title="Période d'analyse"
          subtitle="Sélectionnez la période à analyser"
          icon={<AccessTimeIcon />}
          sx={{ width: "100%", maxWidth: "100%" }}
        >
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
                setRange([start, end]);
              }}
              disableFuture
              localeText={{
                start: "Début d'analyse",
                end: "Fin d'analyse",
                cancelButtonLabel: "Annuler",
                toolbarTitle: "",
              }}
            />
            <PeriodChips
              onLast6Months={handleLast6Months}
              onLast12Months={handleLast12Months}
              onLast24Months={handleLast24Months}
              isLoading={formState.isGlobalLoading}
            />
          </Box>
        </FormCard>

        <Alert severity="info" sx={{ m: 1, textAlign: "justify" }}>
          Vous avez consommé{" "}
          <b>{formatKWhLarge(formState.totalConsumption)} </b>
          sur la période analysée (du{" "}
          {dayjs(safeDateRange[0]).format("DD/MM/YYYY")} au{" "}
          {dayjs(safeDateRange[1]).format("DD/MM/YYYY")}), soit une{" "}
          <b>
            moyenne de {formatKWhLarge(formState.totalConsumption / diffDays)}{" "}
            par jour
          </b>{" "}
        </Alert>

        <FormCard
          title="Répartition de la consommation par heure et par saison"
          subtitle="Analyse détaillée de vos habitudes de consommation"
          icon={<AnalyticsIcon />}
          sx={{ width: "100%", maxWidth: "100%" }}
        >
          <HourlySeasonChart />
        </FormCard>

        <FormCard
          title="Répartition de la consommation heure pleine / heure creuse"
          icon={<AccessTimeIcon />}
          sx={{ width: "100%", maxWidth: "100%" }}
        >
          <HpHcSeasonChart />
        </FormCard>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4 }}>
          <Box
            component="button"
            onClick={() => {
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
              window.location.href = "?step=0";
            }}
            sx={{
              backgroundColor: "transparent",
              color: "primary.main",
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 2,
              padding: "12px 24px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              minWidth: 150,
              py: 1.5,
              px: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              "&:hover": {
                backgroundColor: "primary.50",
              },
            }}
          >
            Recommencer
          </Box>
          <Box
            component="button"
            onClick={() => {
              if (!formState.isGlobalLoading) {
                trackEvent({
                  category: "navigation",
                  action: "next-step",
                  name: "analyses-to-simulations",
                });
                handleNext();
              }
            }}
            disabled={formState.isGlobalLoading}
            sx={{
              backgroundColor: formState.isGlobalLoading
                ? "grey.300"
                : "primary.main",
              color: formState.isGlobalLoading
                ? "grey.600"
                : "primary.contrastText",
              border: "none",
              borderRadius: 2,
              padding: "12px 24px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: formState.isGlobalLoading ? "not-allowed" : "pointer",
              minWidth: 250,
              py: 1.5,
              px: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              "&:hover": {
                backgroundColor: formState.isGlobalLoading
                  ? "grey.300"
                  : "primary.dark",
              },
              "&:disabled": {
                backgroundColor: "grey.300",
                color: "grey.600",
              },
            }}
          >
            {formState.isGlobalLoading && (
              <CircularProgress size={20} color="inherit" />
            )}
            {formState.isGlobalLoading
              ? "Préparation de votre analyse en cours..."
              : "Continuer vers les simulations"}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
