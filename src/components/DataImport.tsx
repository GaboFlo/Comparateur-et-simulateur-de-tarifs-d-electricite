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
import {
  parseCsvToConsumptionLoadCurveData,
  parseEnedisCsvToConsumptionLoadCurveData,
} from "../scripts/csvParser";
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
import FormField from "./FormField";
import TooltipModal from "./TooltipModal";

interface Props {
  handleNext: () => void;
}

type ImportMode = "edf" | "enedis";

const processEdfZipFile = async (file: File) => {
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Le fichier est trop volumineux (maximum 50MB)");
  }

  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  const csvFiles = Object.values(zipContent.files).filter(
    (f) =>
      f.name.includes("puissances-atteintes-30min") && f.name.endsWith(".csv")
  );

  if (csvFiles.length === 0) {
    throw new Error("Aucun fichier CSV trouvé dans le ZIP");
  }

  if (csvFiles.length > 1) {
    throw new Error("Plusieurs fichiers CSV trouvés, un seul attendu");
  }

  const csvFile = csvFiles[0];

  const csvContent = await csvFile.async("string");
  if (csvContent.length > 10 * 1024 * 1024) {
    throw new Error("Le contenu CSV est trop volumineux");
  }

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

const processEnedisCsvFile = async (file: File) => {
  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Le fichier est trop volumineux (maximum 50MB)");
  }

  const csvContent = await file.text();
  if (csvContent.length > 10 * 1024 * 1024) {
    throw new Error("Le contenu CSV est trop volumineux");
  }

  const parsedData = parseEnedisCsvToConsumptionLoadCurveData(csvContent);
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
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [openTooltipCsv, setOpenTooltipCsv] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDataProcessed, setIsDataProcessed] = React.useState(false);
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [importMode, setImportMode] = React.useState<ImportMode>("edf");

  const { formState, setFormState } = useFormContext();
  const { trackEvent } = useMatomo();

  const updateFormState = React.useCallback(
    (
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
    },
    [setFormState]
  );

  const acceptTypes:
    | { "application/zip": string[] }
    | { "text/csv": string[] } = React.useMemo(() => {
    if (importMode === "edf") {
      return {
        "application/zip": [".zip"],
      };
    }
    return {
      "text/csv": [".csv"],
    };
  }, [importMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptTypes,
    maxFiles: 1,
    disabled: isProcessing || isCalculating,
    onDrop: React.useCallback(
      (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setIsProcessing(true);
        setError(null);
        setIsDataProcessed(false);
        const file = acceptedFiles[0];

        const processFile =
          importMode === "edf" ? processEdfZipFile : processEnedisCsvFile;

        processFile(file)
          .then(
            ({
              parsedData,
              analyzedDateRange,
              seasonData,
              totalConsumption,
            }) => {
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
                name: `${importMode}-${file.name}`,
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
              name: error instanceof Error ? error.message : "unknown",
            });
          })
          .finally(() => {
            setIsProcessing(false);
          });
      },
      [trackEvent, updateFormState, importMode]
    ),
  });

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
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors du pré-calcul des simulations"
      );
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

  const handleTooltipCsvClose = () => {
    setOpenTooltipCsv(false);
  };

  const handleTooltipCsvOpen = () => {
    setOpenTooltipCsv(true);
    trackEvent({ category: "info-upload-data", action: "open" });
  };

  return (
    <Stack spacing={4}>
      <FormCard
        title="Méthode d'import"
        subtitle="Sélectionnez la méthode d'import de vos données"
        icon={<AssignmentIcon />}
      >
        <FormField
          label="Méthode d'import"
          type="select"
          value={importMode}
          onChange={(value) => {
            setImportMode(value as ImportMode);
            setError(null);
            setIsDataProcessed(false);
          }}
          options={[
            { value: "edf", label: "EDF (ZIP)" },
            { value: "enedis", label: "Enedis (CSV)" },
          ]}
        />
      </FormCard>

      <FormCard
        title="Instructions d'import"
        subtitle="Suivez ces étapes pour récupérer vos données"
        icon={<AssignmentIcon />}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            {importMode === "edf" ? (
              <>
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
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  1. Installez{" "}
                  <a
                    href="https://chromewebstore.google.com/detail/conso-downloader/geldaniiglcfekimaghpdiiabjaflllp"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    l'extension Chrome
                  </a>{" "}
                  développée par{" "}
                  <a
                    href="https://github.com/bokub/conso-api"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Bokub
                  </a>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  2. Rendez-vous sur{" "}
                  <a
                    href="https://mon-compte-particulier.enedis.fr/visualiser-vos-mesures-consommation"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    votre espace client Enedis
                  </a>
                  , dans la section "Suivre ma consommation" :{" "}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  3. Un nouveau bouton gris apparaît en bas à gauche de la page
                  avec le texte <b>Télécharger tout mon historique</b>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  4. Sélectionnez l'option "Heures", puis cliquez sur
                  "Visualiser" pour afficher vos données horaires
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  5. Une fois les données horaires affichées, le bouton devient
                  bleu et cliquable
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  6. Cliquez dessus, patientez quelques secondes : votre fichier
                  CSV contenant tout votre historique sera téléchargé
                  automatiquement
                </Typography>
                <Typography variant="body2">
                  7. Importez directement le fichier CSV téléchargé ci-dessous
                </Typography>
              </>
            )}
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
        subtitle={
          importMode === "edf"
            ? "Glissez-déposez votre fichier ZIP ou cliquez pour sélectionner"
            : "Glissez-déposez votre fichier CSV ou cliquez pour sélectionner"
        }
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

            const getUploadText = () => {
              if (isDragActive) {
                return "Déposez le fichier ici";
              }
              return importMode === "edf"
                ? "Sélectionnez votre fichier ZIP"
                : "Sélectionnez votre fichier CSV";
            };

            return (
              <Stack spacing={2} alignItems="center">
                <Box
                  sx={{
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
                  {getUploadText()}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {importMode === "edf"
                    ? "Format accepté : fichier ZIP directement issu du téléchargement EDF"
                    : "Format accepté : fichier CSV Enedis avec colonnes debut;fin;kW"}
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
        title={
          importMode === "edf"
            ? "Comment télécharger votre consommation EDF ?"
            : "Comment télécharger votre consommation Enedis ?"
        }
        description={
          importMode === "edf"
            ? "Rendez-vous sur votre espace EDF et suivez les instructions pour télécharger votre consommation depuis https://suiviconso.edf.fr/comprendre .<br/><br/> Pensez à bien exporter la conso par heure, en kWh. <br/> Vous pouvez directement importer le fichier ZIP téléchargé."
            : "Rendez-vous sur votre espace Enedis et téléchargez votre courbe de charge au format CSV.<br/><br/> Plus d'informations dans la documentation de l'extension Chrome : https://chromewebstore.google.com/detail/conso-downloader/geldaniiglcfekimaghpdiiabjaflllp"
        }
        open={openTooltipCsv}
        handleClose={handleTooltipCsvClose}
        imgPath={
          importMode === "edf" ? "/edf-download.png" : "/enedis-download.png"
        }
        imgDescription={
          importMode === "edf"
            ? "Page de téléchargement de la consommation"
            : undefined
        }
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
  );
}
