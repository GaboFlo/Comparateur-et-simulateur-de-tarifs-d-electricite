import { useMatomo } from "@jonkoops/matomo-tracker-react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ErrorIcon from "@mui/icons-material/Error";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { MobileDateRangePicker } from "@mui/x-date-pickers-pro";
import dayjs from "dayjs";
import JSZip from "jszip";
import * as React from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "../context/FormContext";
import { calculateRowSummary } from "../scripts/calculators";
import { parseCsvToConsumptionLoadCurveData } from "../scripts/csvParser";
import { analyseHourByHourBySeason } from "../scripts/statistics";
import { findFirstAndLastDate, formatKWhLarge } from "../scripts/utils";
import hphc_data from "../statics/hp_hc.json";
import allOffersFile from "../statics/price_mapping.json";
import {
  ComparisonTableInterfaceRow,
  ConsumptionLoadCurveData,
  HpHcSlot,
  PriceMappingFile,
  SeasonHourlyAnalysis,
} from "../types";
import ActionButton from "./ActionButton";
import FormCard from "./FormCard";
import HourlySeasonChart from "./HourlySeasonChart";
import HpHcSeasonChart from "./HpHcSeasonChart";
import PeriodChips from "./PeriodChips";
import TooltipModal from "./TooltipModal";

interface Props {
  handleNext: () => void;
}

const processFileData = async (file: File) => {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  const csvFile = Object.values(zipContent.files).find(
    (f) =>
      f.name.includes("puissances-atteintes-30min") && f.name.endsWith(".csv")
  );

  if (!csvFile) {
    throw new Error("Aucun fichier CSV trouvé dans le ZIP");
  }

  const csvContent = await csvFile.async("string");
  const parsedData = parseCsvToConsumptionLoadCurveData(csvContent);
  const analyzedDateRange = findFirstAndLastDate(parsedData);
  const seasonData = analyseHourByHourBySeason({
    data: parsedData,
    dateRange: analyzedDateRange,
  });
  const totalConsumption = seasonData.reduce(
    (acc, cur) => acc + cur.seasonTotalSum,
    0
  );

  return { parsedData, analyzedDateRange, seasonData, totalConsumption };
};

const scrollToPeriodAnalysis = (isProcessing: boolean) => {
  setTimeout(() => {
    const periodAnalysisElement = document.querySelector(
      '[data-section="period-analysis"]'
    );
    if (periodAnalysisElement && !isProcessing) {
      periodAnalysisElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }, 500);
};

const scrollToBottom = () => {
  setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, 500);
};

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

export default function DataImport({ handleNext }: Readonly<Props>) {
  const { formState, setFormState } = useFormContext();
  const { trackEvent } = useMatomo();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [openTooltipCsv, setOpenTooltipCsv] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDataProcessed, setIsDataProcessed] = React.useState(false);
  const [isCalculating, setIsCalculating] = React.useState(false);

  const updateFormState = (
    seasonData: SeasonHourlyAnalysis[],
    analyzedDateRange: [Date, Date],
    totalConsumption: number,
    parsedData: ConsumptionLoadCurveData[]
  ) => {
    const defaultHpHc = hphc_data as HpHcSlot[];
    setFormState((prevState) => ({
      ...prevState,
      seasonHourlyAnalysis: seasonData,
      analyzedDateRange: analyzedDateRange,
      totalConsumption: totalConsumption,
      parsedData: parsedData,
      // Préserver la configuration HP/HC existante si elle existe, sinon utiliser la configuration par défaut
      hpHcConfig:
        prevState.hpHcConfig && prevState.hpHcConfig.length > 0
          ? prevState.hpHcConfig
          : defaultHpHc,
    }));
  };

  // Fonction de pré-calcul des simulations
  const preCalculateSimulations = React.useCallback(async () => {
    if (
      !formState.parsedData ||
      !formState.hpHcConfig ||
      !formState.analyzedDateRange
    ) {
      return;
    }

    setIsCalculating(true);

    try {
      const allOffers = allOffersFile as PriceMappingFile;
      const newRowSummaries: ComparisonTableInterfaceRow[] = [];

      // Calculer les simulations pour toutes les offres
      for (const option of allOffers) {
        const costForOption = calculateRowSummary({
          data: formState.parsedData,
          dateRange: formState.analyzedDateRange,
          powerClass: formState.powerClass,
          optionKey: option.optionKey,
          offerType: option.offerType,
          optionName: option.optionName,
          provider: option.provider,
          lastUpdate: option.lastUpdate,
          link: option.link,
          hpHcData: formState.hpHcConfig,
          overridingHpHcKey: option.overridingHpHcKey,
        });

        newRowSummaries.push(costForOption);
      }

      // Mettre à jour le state avec les calculs pré-calculés
      setFormState((prevState) => ({
        ...prevState,
        rowSummaries: newRowSummaries,
      }));

      // Scroll vers la section "Période d'analyse" une fois les calculs terminés
      scrollToPeriodAnalysis(isProcessing);
    } catch (error) {
      console.error("Erreur lors du pré-calcul des simulations:", error);
    } finally {
      setIsCalculating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formState.parsedData,
    formState.hpHcConfig,
    formState.analyzedDateRange,
    formState.powerClass,
    setFormState,
  ]);

  // useEffect pour déclencher le pré-calcul quand les données sont disponibles
  React.useEffect(() => {
    if (
      isDataProcessed &&
      formState.parsedData &&
      formState.hpHcConfig &&
      formState.analyzedDateRange
    ) {
      preCalculateSimulations();
    }
  }, [
    isDataProcessed,
    formState.parsedData,
    formState.hpHcConfig,
    formState.analyzedDateRange,
    preCalculateSimulations,
  ]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsProcessing(true);
      setError(null);
      setIsDataProcessed(false);
      const file = acceptedFiles[0];

      processFileData(file)
        .then(
          ({ parsedData, analyzedDateRange, seasonData, totalConsumption }) => {
            updateFormState(
              seasonData,
              analyzedDateRange,
              totalConsumption,
              parsedData
            );
            setIsDataProcessed(true);
            setError(null);

            scrollToBottom();

            trackEvent({
              category: "data-import",
              action: "success",
              name: file.name,
            });
          }
        )
        .catch((error) => {
          console.error("Erreur lors du traitement du fichier:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Erreur lors du traitement du fichier"
          );
          setIsDataProcessed(false);
          trackEvent({
            category: "data-import",
            action: "error",
            name: error instanceof Error ? error.message : "Unknown error",
          });
        })
        .finally(() => {
          setIsProcessing(false);
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleNext, trackEvent]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/zip": [".zip"],
    },
    maxFiles: 1,
    disabled: isProcessing || isCalculating,
  });

  const handleTooltipCsvClose = () => {
    setOpenTooltipCsv(false);
  };

  const handleTooltipCsvOpen = () => {
    setOpenTooltipCsv(true);
    trackEvent({ category: "info-upload-data", action: "open" });
  };

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

  const { handleLast6Months, handleLast12Months, handleLast24Months } =
    createDateRangeHandlers(setRange);

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={4} sx={{ width: "100%" }}>
        <FormCard
          title="Instructions d'import"
          subtitle="Suivez ces étapes pour récupérer vos données"
          icon={<AssignmentIcon />}
          sx={{ width: "100%" }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                1. Connectez-vous à votre espace EDF sur{" "}
                <a
                  href="https://suiviconso.edf.fr/comprendre"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  suiviconso.edf.fr
                </a>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                2. Téléchargez votre consommation par pallier de 30 minutes
                (format ZIP)
              </Typography>
              <Typography variant="body2">
                3. Importez directement le fichier ZIP téléchargé ci-dessous
              </Typography>
            </Box>
            <IconButton
              onClick={handleTooltipCsvOpen}
              size="small"
              sx={{ mt: 0.5 }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Box>
        </FormCard>

        <FormCard
          title="Zone de dépôt"
          subtitle="Glissez-déposez votre fichier ZIP ou cliquez pour sélectionner"
          icon={<CloudUploadIcon />}
          sx={{ width: "100%" }}
        >
          <Box
            {...getRootProps()}
            sx={{
              border: "2px dashed",
              borderColor: isDragActive ? "primary.main" : "divider",
              borderRadius: 3,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              backgroundColor: isDragActive ? "primary.50" : "background.paper",
              minHeight: 250,
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "primary.50",
              },
            }}
          >
            <input {...getInputProps()} />

            {(() => {
              if (isProcessing) {
                return (
                  <Stack spacing={2} alignItems="center">
                    <CircularProgress size={48} />
                    <Typography variant="h6" color="primary">
                      Traitement en cours...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Analyse de vos données de consommation
                    </Typography>
                  </Stack>
                );
              }

              if (isCalculating) {
                return (
                  <Stack spacing={2} alignItems="center">
                    <CircularProgress size={48} />
                    <Typography variant="h6" color="primary">
                      Calculs en cours...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Préparation des simulations
                    </Typography>
                  </Stack>
                );
              }

              if (isDataProcessed) {
                return (
                  <Stack spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor: "success.50",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "success.main",
                        fontSize: "1.5rem",
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: "inherit" }} />
                    </Box>

                    <Typography variant="h6" color="text.primary">
                      Données traitées avec succès
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Vos données de consommation ont été analysées
                    </Typography>

                    <Typography
                      variant="h6"
                      color="success.main"
                      sx={{ fontWeight: 600 }}
                    >
                      {formState.totalConsumption &&
                      formState.totalConsumption > 0
                        ? `${formState.totalConsumption.toLocaleString(
                            "fr-FR"
                          )} kWh analysés`
                        : "Données analysées"}
                    </Typography>

                    <ActionButton
                      variant="outline"
                      onClick={() => {
                        setIsDataProcessed(false);
                        setFormState((prev) => ({
                          ...prev,
                          seasonHourlyAnalysis: undefined,
                          parsedData: undefined,
                          totalConsumption: 0,
                          rowSummaries: [],
                        }));
                      }}
                      sx={{
                        background: "rgba(25, 118, 210, 0.05)",
                        borderColor: "primary.main",
                        color: "primary.main",
                      }}
                    >
                      Changer de fichier
                    </ActionButton>
                  </Stack>
                );
              }

              return (
                <Stack spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      backgroundColor: "primary.50",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "primary.main",
                      fontSize: "1.5rem",
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: "inherit" }} />
                  </Box>

                  <Typography variant="h6" color="text.primary">
                    {isDragActive
                      ? "Déposez le fichier ici"
                      : "Sélectionnez votre fichier ZIP"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Format accepté : fichier ZIP directement issu du
                    téléchargement EDF
                  </Typography>

                  <ActionButton
                    variant="outline"
                    sx={{
                      background: "rgba(25, 118, 210, 0.05)",
                      borderColor: "primary.main",
                      color: "primary.main",
                    }}
                  >
                    Choisir un fichier
                  </ActionButton>
                </Stack>
              );
            })()}
          </Box>
        </FormCard>

        {error && (
          <FormCard
            title="Erreur de traitement"
            subtitle="Une erreur s'est produite lors du traitement de votre fichier"
            icon={<ErrorIcon />}
          >
            <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          </FormCard>
        )}

        {isDataProcessed && formState.seasonHourlyAnalysis && (
          <>
            <FormCard
              title="Période d'analyse"
              subtitle="Sélectionnez la période à analyser"
              icon={<AccessTimeIcon />}
              data-section="period-analysis"
              sx={{ width: "100%" }}
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
                moyenne de{" "}
                {formatKWhLarge(formState.totalConsumption / diffDays)} par jour
              </b>{" "}
            </Alert>
          </>
        )}

        {isDataProcessed && formState.seasonHourlyAnalysis && (
          <>
            <FormCard
              title="Répartition de la consommation par heure et par saison"
              subtitle="Analyse détaillée de vos habitudes de consommation"
              icon={<AnalyticsIcon />}
              sx={{ width: "100%" }}
            >
              <HourlySeasonChart />
            </FormCard>
            <FormCard
              title="Répartition de la consommation heure pleine / heure creuse"
              icon={<AccessTimeIcon />}
              sx={{ width: "100%" }}
            >
              <HpHcSeasonChart />
            </FormCard>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <ActionButton
                variant="primary"
                onClick={() => {
                  // Désactiver temporairement le scroll automatique
                  setIsProcessing(true);
                  setTimeout(() => {
                    handleNext();
                  }, 100);
                }}
                sx={{ minWidth: 250, py: 1.5, px: 3 }}
              >
                Continuer vers les simulations
              </ActionButton>
            </Box>
          </>
        )}

        <TooltipModal
          title="Comment télécharger votre consommation ?"
          description="Rendez-vous sur votre espace EDF et suivez les instructions pour télécharger votre consommation depuis https://suiviconso.edf.fr/comprendre .<br/><br/> Pensez à bien exporter la conso par heure, en kWh. <br/> Vous pouvez directement importer le fichier ZIP téléchargé."
          open={openTooltipCsv}
          handleClose={handleTooltipCsvClose}
          imgPath="/edf-download.png"
          imgDescription="Page de téléchargement de la consommation"
        />
      </Stack>
    </Box>
  );
}
