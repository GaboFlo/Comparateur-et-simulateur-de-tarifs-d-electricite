import { useMatomo } from "@jonkoops/matomo-tracker-react";
import { Button, Typography } from "@mui/material";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/system";
import { MobileDateRangePicker } from "@mui/x-date-pickers-pro";
import dayjs from "dayjs";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../context/FormContext";
import {
  ComparisonTableInterfaceRow,
  OfferType,
  OptionKey,
  PriceMappingFile,
} from "../types";

import { calculateRowSummary } from "../scripts/calculators";
import { analyseHourByHourBySeason } from "../scripts/statistics";
import allOffersFile from "../statics/price_mapping.json";
import HpHcSlotSelector from "./HpHcSelector";
import PeriodChips from "./PeriodChips";

// Lazy loading du composant volumineux
const ComparisonTable = React.lazy(() => import("./ComparisonTable"));

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

  const safeDateRange = validateDateRange(
    formState.analyzedDateRange || [
      new Date(new Date().getFullYear() - 1, 0, 1),
      new Date(),
    ]
  );

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

    const seasonData = analyseHourByHourBySeason({
      data: formState.parsedData,
      dateRange: range,
    });
    const totalConsumption = seasonData.reduce(
      (acc, cur) => acc + cur.seasonTotalSum,
      0
    );

    // Recalculer les simulations avec la nouvelle période
    const allOffers = allOffersFile as PriceMappingFile;
    const newRowSummaries: ComparisonTableInterfaceRow[] = [];

    for (const option of allOffers) {
      const costForOption = calculateRowSummary({
        data: formState.parsedData,
        dateRange: range,
        powerClass: formState.powerClass,
        optionKey: option.optionKey,
        offerType: option.offerType,
        optionName: option.optionName,
        provider: option.provider,
        lastUpdate: option.lastUpdate,
        link: option.link,
        hpHcData: formState.hpHcConfig ?? [],
        overridingHpHcKey: option.overridingHpHcKey,
      });

      newRowSummaries.push(costForOption);
    }

    setFormState((prevState) => ({
      ...prevState,
      seasonHourlyAnalysis: seasonData,
      analyzedDateRange: range,
      totalConsumption: totalConsumption,
      rowSummaries: newRowSummaries,
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

  // Vérifier si les données nécessaires sont disponibles
  if (
    !formState.seasonHourlyAnalysis ||
    formState.seasonHourlyAnalysis.length === 0
  ) {
    return (
      <Stack textAlign={"center"} spacing={2}>
        <Typography variant="h6" color="warning.main">
          Aucune donnée de simulation disponible
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Veuillez d'abord importer vos données de consommation.
        </Typography>
        <Button variant="outlined" color="primary" onClick={handleRestart}>
          Recommencer
        </Button>
      </Stack>
    );
  }

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
        <PeriodChips
          onLast6Months={handleLast6Months}
          onLast12Months={handleLast12Months}
          onLast24Months={handleLast24Months}
          isLoading={formState.isGlobalLoading}
        />
      </Box>

      <Typography variant="h5" sx={{ mt: 2 }}>
        Combien auriez-vous gagné en changeant d'offre ?
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Les prix (TTC) sont <b>simulés</b> en fonction de votre consommation que
        vous venez d'importer, sur la même période. <br />
        Ils peuvent différer de vos factures car la simulation est réalisée sur
        la base des tarifs actuels des fournisseurs.
      </Typography>
      <React.Suspense fallback={<div>Chargement des données...</div>}>
        {formState && typeof formState === "object" ? (
          <ComparisonTable />
        ) : (
          <div>Erreur de chargement des données</div>
        )}
      </React.Suspense>
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
