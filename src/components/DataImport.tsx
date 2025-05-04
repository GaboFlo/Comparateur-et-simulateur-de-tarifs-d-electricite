import { useMatomo } from "@jonkoops/matomo-tracker-react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { CircularProgress, IconButton } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import JSZip from "jszip";
import * as React from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../context/FormContext";
import { parseCsvToConsumptionLoadCurveData } from "../scripts/csvParser";
import { analyseHourByHourBySeason } from "../scripts/statistics";
import { findFirstAndLastDate } from "../scripts/utils";
import TooltipModal from "./TooltipModal";

interface Props {
  handleNext: () => void;
}
export default function DataImport({ handleNext }: Readonly<Props>) {
  const { formState, setFormState } = useFormContext();
  const { trackEvent } = useMatomo();
  const acceptedFormats = [".zip"];
  const [openTooltipCsv, setOpenToolTipCsv] = React.useState(false);
  const [fileError, setFileError] = React.useState<string | null>(null);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (!formState.hpHcConfig) {
      navigate("?step=0");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const explanationOpened = localStorage.getItem(
      "explanation_edf_zip_opened"
    );
    if (explanationOpened !== "true") {
      setOpenToolTipCsv(true);
      localStorage.setItem("explanation_edf_zip_opened", "true");
    }
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    setFileError(null);
    const invalidFile = acceptedFiles.find(
      (file) => !acceptedFormats.some((format) => file.name.endsWith(format))
    );

    if (invalidFile || acceptedFiles.length !== 1) {
      setFileError(
        `Le fichier ${invalidFile?.name ?? ""} n'est pas au format ZIP.`
      );
      return;
    }

    processFiles(acceptedFiles);
  };

  const processFiles = async (files: File[]) => {
    setFormState((prevState) => ({
      ...prevState,
      isGlobalLoading: true,
    }));

    for (const file of files) {
      try {
        const zip = await JSZip.loadAsync(file);
        const csvFiles = await extractCsvFiles(zip);

        if (csvFiles.length !== 1) {
          setFileError("Aucun csv dans le ZIP");
          continue;
        }

        const csvText = await csvFiles[0].text();
        const parsedData = parseCsvToConsumptionLoadCurveData(csvText);
        const analyzedDateRange = findFirstAndLastDate(parsedData);
        const seasonData = analyseHourByHourBySeason({
          data: parsedData,
          dateRange: analyzedDateRange,
        });
        const totalConsumption = seasonData.reduce(
          (acc, cur) => acc + cur.seasonTotalSum,
          0
        );

        updateFormState(
          seasonData,
          analyzedDateRange,
          totalConsumption,
          parsedData
        );
        handleNext();
      } catch (error) {
        setFileError("Une erreur est survenue pendant l'analyse");
      }
    }

    formState.isGlobalLoading = false;
  };

  const extractCsvFiles = async (zip: JSZip): Promise<Blob[]> => {
    const csvFiles: Promise<Blob>[] = [];
    zip.forEach((relativePath, zipEntry) => {
      if (
        zipEntry.name.startsWith("mes-puissances-atteintes-30min") &&
        zipEntry.name.endsWith(".csv")
      ) {
        csvFiles.push(zipEntry.async("blob"));
      }
    });
    return Promise.all(csvFiles);
  };

  const updateFormState = (
    seasonData: any,
    analyzedDateRange: any,
    totalConsumption: number,
    parsedData: any
  ) => {
    setFormState((prevState) => ({
      ...prevState,
      seasonHourlyAnalysis: seasonData,
      analyzedDateRange: analyzedDateRange,
      totalConsumption: totalConsumption,
      parsedData: parsedData,
    }));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/zip": acceptedFormats,
    },
    maxFiles: 1,
  });

  const handleTooltipCsvClose = () => {
    setOpenToolTipCsv(false);
  };

  const handleTooltipCsvOpen = () => {
    setOpenToolTipCsv(true);
    trackEvent({ category: "info-upload-data", action: "open" });
  };

  return (
    <Stack spacing={{ xs: 3, sm: 3 }} useFlexGap>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Alert
          severity="info"
          icon={<InfoRoundedIcon />}
          variant="outlined"
          sx={{
            alignItems: "center",
            width: "100%",
          }}
        >
          Vous pouvez télécharger votre consommation, par pallier de 30 minutes,
          sur votre Espace EDF. Le fichier ZIP doit être réimporté ici.{" "}
          <IconButton
            onClick={handleTooltipCsvOpen}
            size="medium"
            sx={{
              border: "none",
            }}
          >
            <HelpOutlineIcon />
          </IconButton>
          <TooltipModal
            title="Comment télécharger votre consommation ?"
            description="Rendez-vous sur votre espace EDF et suivez les instructions pour télécharger votre consommation depuis https://suiviconso.edf.fr/comprendre .<br/><br/> Pensez à bien exporter la conso par heure, en kWh. <br/> Vous pouvez directement importer le fichier ZIP téléchargé."
            open={openTooltipCsv}
            handleClose={handleTooltipCsvClose}
            imgPath="/edf-download.png"
            imgDescription="Page de téléchargement de la consommation"
          />
        </Alert>
        {fileError && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {fileError}
          </Alert>
        )}
        <Box
          {...getRootProps()}
          sx={{
            border: "2px dashed #ccc",
            borderRadius: "8px",
            padding: 2,
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            {formState.isGlobalLoading && <CircularProgress />}
            {!formState.isGlobalLoading && (
              <>
                <Grid size={2}>
                  <input {...getInputProps()} />
                  <UploadFileRoundedIcon sx={{ fontSize: 50 }} />
                </Grid>
                <Grid size={10}>
                  <p>
                    Déposez votre fichier <b>ZIP</b> ici, ou cliquez pour ouvrir
                    la fenêtre d'import <br />
                    <b>Seul ce format est accepté</b>
                  </p>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Box>
    </Stack>
  );
}
