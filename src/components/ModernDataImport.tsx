import { useMatomo } from "@jonkoops/matomo-tracker-react";
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
  PriceMappingFile,
  SeasonHourlyAnalysis,
} from "../types";
import ModernActionButton from "./ModernActionButton";
import ModernFormCard from "./ModernFormCard";
import TooltipModal from "./TooltipModal";

interface Props {
  handleNext: () => void;
}

export default function ModernDataImport({ handleNext }: Readonly<Props>) {
  const { formState, setFormState } = useFormContext();
  const { trackEvent } = useMatomo();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [openTooltipCsv, setOpenTooltipCsv] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDataProcessed, setIsDataProcessed] = React.useState(false);
  const [isPreCalculating, setIsPreCalculating] = React.useState(false);

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
      console.log("Données manquantes pour le pré-calcul:", {
        parsedData: !!formState.parsedData,
        hpHcConfig: !!formState.hpHcConfig,
        analyzedDateRange: !!formState.analyzedDateRange,
      });
      return;
    }

    setIsPreCalculating(true);
    console.log("Début du pré-calcul des simulations...");

    try {
      const allOffers = allOffersFile as PriceMappingFile;
      const newRowSummaries: ComparisonTableInterfaceRow[] = [];

      console.log("Nombre d'offres à calculer:", allOffers.length);

      // Calculer les simulations pour toutes les offres
      for (const option of allOffers) {
        const costForOption = calculateRowSummary({
          data: formState.parsedData!,
          dateRange: formState.analyzedDateRange!,
          powerClass: formState.powerClass,
          optionKey: option.optionKey,
          offerType: option.offerType,
          optionName: option.optionName,
          provider: option.provider,
          lastUpdate: option.lastUpdate,
          link: option.link,
          hpHcData: formState.hpHcConfig!,
          overridingHpHcKey: option.overridingHpHcKey,
        });

        newRowSummaries.push(costForOption);
      }

      // Mettre à jour le state avec les calculs pré-calculés
      setFormState((prevState) => ({
        ...prevState,
        rowSummaries: newRowSummaries,
      }));

      console.log(
        "Pré-calcul des simulations terminé",
        newRowSummaries.length,
        "offres calculées"
      );
    } catch (error) {
      console.error("Erreur lors du pré-calcul des simulations:", error);
    } finally {
      setIsPreCalculating(false);
    }
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
      console.log("Données disponibles, lancement du pré-calcul...");
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
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setIsProcessing(true);
      setError(null);
      setIsDataProcessed(false);
      const file = acceptedFiles[0];

      try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        console.log("Fichiers dans le ZIP:", Object.keys(zipContent.files));

        // Chercher spécifiquement le fichier de puissances atteintes par palier de 30 minutes
        const csvFile = Object.values(zipContent.files).find(
          (f) =>
            f.name.includes("puissances-atteintes-30min") &&
            f.name.endsWith(".csv")
        );

        if (!csvFile) {
          throw new Error("Aucun fichier CSV trouvé dans le ZIP");
        }

        console.log("Fichier CSV trouvé:", csvFile.name);
        const csvContent = await csvFile.async("string");
        console.log(
          "Contenu CSV (premiers 500 caractères):",
          csvContent.substring(0, 500)
        );

        const parsedData = parseCsvToConsumptionLoadCurveData(csvContent);
        console.log("Données parsées:", {
          length: parsedData.length,
          firstEntry: parsedData[0],
          lastEntry: parsedData[parsedData.length - 1],
          sampleEntries: parsedData.slice(0, 5),
        });

        const analyzedDateRange = findFirstAndLastDate(parsedData);
        const seasonData = analyseHourByHourBySeason({
          data: parsedData,
          dateRange: analyzedDateRange,
        });
        const totalConsumption = seasonData.reduce(
          (acc, cur) => acc + cur.seasonTotalSum,
          0
        );

        console.log("Données analysées:", {
          seasonDataLength: seasonData.length,
          totalConsumption,
          seasonData: seasonData.map((s) => ({
            season: s.season,
            total: s.seasonTotalSum,
          })),
        });

        updateFormState(
          seasonData,
          analyzedDateRange,
          totalConsumption,
          parsedData
        );
        setIsDataProcessed(true);
        setError(null);

        // Scroll vers le bas pour montrer le bouton de l'étape suivante
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
        }, 500);

        trackEvent({
          category: "data-import",
          action: "success",
          name: file.name,
        });
      } catch (error) {
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
      } finally {
        setIsProcessing(false);
      }
    },
    [handleNext, trackEvent]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/zip": [".zip"],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const handleTooltipCsvClose = () => {
    setOpenTooltipCsv(false);
  };

  const handleTooltipCsvOpen = () => {
    setOpenTooltipCsv(true);
    trackEvent({ category: "info-upload-data", action: "open" });
  };

  return (
    <Stack spacing={4}>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 1,
          }}
        >
          Importez vos données de consommation
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            maxWidth: 600,
            mx: "auto",
          }}
        >
          Téléchargez votre fichier ZIP depuis votre espace EDF pour analyser
          votre consommation réelle
        </Typography>
      </Box>

      <ModernFormCard
        title="Instructions d'import"
        subtitle="Suivez ces étapes pour récupérer vos données"
        icon={<AssignmentIcon />}
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
      </ModernFormCard>

      <ModernFormCard
        title="Zone de dépôt"
        subtitle="Glissez-déposez votre fichier ZIP ou cliquez pour sélectionner"
        icon={<CloudUploadIcon />}
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

          {isProcessing ? (
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={48} />
              <Typography variant="h6" color="primary">
                Traitement en cours...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analyse de vos données de consommation
              </Typography>
            </Stack>
          ) : (
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
                Format accepté : fichier ZIP contenant un CSV de consommation
                EDF
              </Typography>

              <ModernActionButton
                variant="outline"
                sx={{
                  background: "rgba(25, 118, 210, 0.05)",
                  borderColor: "primary.main",
                  color: "primary.main",
                }}
              >
                Choisir un fichier
              </ModernActionButton>
            </Stack>
          )}
        </Box>
      </ModernFormCard>

      {error && (
        <ModernFormCard
          title="Erreur de traitement"
          subtitle="Une erreur s'est produite lors du traitement de votre fichier"
          icon={<ErrorIcon />}
        >
          <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </ModernFormCard>
      )}

      {isDataProcessed && (
        <ModernFormCard
          title="Données traitées avec succès"
          subtitle="Vos données de consommation ont été analysées"
          icon={<CheckCircleIcon />}
        >
          <Alert
            severity="success"
            variant="outlined"
            sx={{ borderRadius: 2, mb: 2 }}
          >
            <Typography variant="body2">
              {formState.totalConsumption && formState.totalConsumption > 0
                ? `${formState.totalConsumption.toLocaleString(
                    "fr-FR"
                  )} kWh analysés`
                : "Données analysées mais consommation non calculée"}
            </Typography>
            {isPreCalculating && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                ⏳ Préparation des simulations en cours...
              </Typography>
            )}
          </Alert>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <ModernActionButton
              variant="primary"
              onClick={handleNext}
              loading={isPreCalculating}
              sx={{ minWidth: 200 }}
            >
              {isPreCalculating
                ? "Préparation des simulations..."
                : "Continuer vers les simulations"}
            </ModernActionButton>
          </Box>
        </ModernFormCard>
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
  );
}
