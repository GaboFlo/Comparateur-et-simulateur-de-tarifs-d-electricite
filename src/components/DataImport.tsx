import { useMatomo } from "@jonkoops/matomo-tracker-react";
import {
  Assignment as AssignmentIcon,
  CloudUpload as CloudUploadIcon,
  Error as ErrorIcon,
  HelpOutline as HelpOutlineIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import JSZip from "jszip";
import * as React from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "../context/FormContext";
import { calculateRowSummary } from "../scripts/calculators";
import { parseCsvToConsumptionLoadCurveData } from "../scripts/csvParser";
import { analyseHourByHourBySeason } from "../scripts/statistics";
import { findFirstAndLastDate } from "../scripts/utils";
import hphc_data from "../statics/hp_hc.json";
import allOffersFile from "../statics/price_mapping.json";
import {
  ComparisonTableInterfaceRow,
  ConsumptionLoadCurveData,
  HpHcSlot,
  OfferType,
  OptionKey,
  PriceMappingFile,
  SeasonHourlyAnalysis,
} from "../types";
import ActionButton from "./ActionButton";
import FormCard from "./FormCard";
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

export default function DataImport({ handleNext }: Readonly<Props>) {
  let formState;
  let setFormState;
  let trackEvent;

  try {
    const context = useFormContext();
    formState = context.formState;
    setFormState = context.setFormState;
    const matomoContext = useMatomo();
    trackEvent = matomoContext.trackEvent;
  } catch (error) {
    // Si le contexte n'est pas disponible, afficher un message d'erreur
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <Typography>Erreur de chargement du contexte</Typography>
      </Box>
    );
  }
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

  // Redirection automatique vers l'étape Analyses quand les calculs sont terminés
  React.useEffect(() => {
    if (
      isDataProcessed &&
      formState.seasonHourlyAnalysis &&
      !isCalculating &&
      formState.rowSummaries.length > 0
    ) {
      trackEvent({
        category: "navigation",
        action: "auto-next-step",
        name: "data-import-to-analyses",
      });
      handleNext();
    }
  }, [
    isDataProcessed,
    formState.seasonHourlyAnalysis,
    isCalculating,
    formState.rowSummaries.length,
    handleNext,
    trackEvent,
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

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={4} sx={{ width: "100%", maxWidth: "100%" }}>
        <FormCard
          title="Instructions d'import"
          subtitle="Suivez ces étapes pour récupérer vos données"
          icon={<AssignmentIcon />}
          sx={{ width: "100%", maxWidth: "100%" }}
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
          sx={{ width: "100%", maxWidth: "100%" }}
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
                    <CircularProgress size={48} />
                    <Typography variant="h6" color="primary">
                      Finalisation en cours...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Préparation de votre analyse
                    </Typography>
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

        <TooltipModal
          title="Comment télécharger votre consommation ?"
          description="Rendez-vous sur votre espace EDF et suivez les instructions pour télécharger votre consommation depuis https://suiviconso.edf.fr/comprendre .<br/><br/> Pensez à bien exporter la conso par heure, en kWh. <br/> Vous pouvez directement importer le fichier ZIP téléchargé."
          open={openTooltipCsv}
          handleClose={handleTooltipCsvClose}
          imgPath="/edf-download.png"
          imgDescription="Page de téléchargement de la consommation"
        />

        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <ActionButton
            variant="outline"
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
              background: "rgba(25, 118, 210, 0.05)",
              borderColor: "primary.main",
              color: "primary.main",
            }}
          >
            Recommencer
          </ActionButton>
        </Box>
      </Stack>
    </Box>
  );
}
