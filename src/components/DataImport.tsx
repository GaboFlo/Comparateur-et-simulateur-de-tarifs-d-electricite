import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { Button, CircularProgress } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import JSZip from "jszip";
import * as React from "react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { parseCsvToConsumptionLoadCurveData } from "../services/csvParser";
import { ConsumptionLoadCurveData } from "../types";
import TooltipModal from "./TooltipModal";

interface Props {
  handleNext: () => void;
}
export default function DataImport({ handleNext }: Props) {
  const [loading, setLoading] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);

  const [extractedData, setExtractedData] = useState<
    ConsumptionLoadCurveData[] | null
  >(null);

  const onDrop = (acceptedFiles: File[]) => {
    setLoading(true);
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const fileContent = reader.result as ArrayBuffer;
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(fileContent);

        try {
          const file = zipContent.file(
            "mes-puissances-atteintes-30min-004047194096-92120.csv"
          );
          if (file) {
            const csvContent = await file.async("string");
            const jsonData = parseCsvToConsumptionLoadCurveData(csvContent);
            setExtractedData(jsonData);
            handleNext();
          } else {
            setParsingError(
              "Le fichier mes-puissances-atteintes-30min-******.csv n'existe pas dans le zip."
            );
          }
        } catch (error) {
          setParsingError(
            `Erreur lors de l'extraction du fichier CSV : ${error}`
          );
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/zip": [".zip"],
    },
  });

  const [openTooltipCsv, setOpenToolTipCsv] = React.useState(false);

  const handleTooltipCsvClose = () => {
    setOpenToolTipCsv(false);
  };

  const handleTooltipCsvOpen = () => {
    setOpenToolTipCsv(true);
  };

  return (
    <Stack spacing={{ xs: 3, sm: 3 }} useFlexGap>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {!loading && extractedData === null && !parsingError && (
          <>
            <Alert
              severity="info"
              icon={<InfoRoundedIcon />}
              variant="outlined"
              sx={{ display: "flex", alignItems: "center" }}
            >
              Vous pouvez télécharger votre consommation, par pallier de 30
              minutes, sur votre Espace EDF
              <Button onClick={handleTooltipCsvOpen}>
                <HelpOutlineIcon sx={{ height: 20 }} />
              </Button>
              <TooltipModal
                title="Comment télécharger votre consommation ?"
                description="Rendez-vous sur votre espace EDF et suivez les instructions pour télécharger votre consommation depuis https://suiviconso.edf.fr/comprendre .<br/> Pensez à bien exporter la conso par heure, en kWh. <br/> Vous pouvez directement importer le fichier ZIP téléchargé."
                open={openTooltipCsv}
                handleClose={handleTooltipCsvClose}
                imgPath="/edf-download.png"
                imgDescription="Page de téléchargement de la consommation"
              />
            </Alert>

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
                <Grid size={2}>
                  <input {...getInputProps()} />
                  <UploadFileRoundedIcon sx={{ fontSize: 50 }} />
                </Grid>
                <Grid size={10}>
                  <p>
                    Déposez votre fichier ZIP ici, ou cliquez pour ouvrir la
                    fenêtre d'import
                  </p>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
        {loading && !extractedData && !parsingError && <CircularProgress />}
        {!loading && extractedData !== null && !parsingError && (
          <Alert severity="success">
            Fichier CSV extrait avec succès. Vous pouvez maintenant continuer.
          </Alert>
        )}
        {parsingError && (
          <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>
            {parsingError}
          </Alert>
        )}
      </Box>
    </Stack>
  );
}
