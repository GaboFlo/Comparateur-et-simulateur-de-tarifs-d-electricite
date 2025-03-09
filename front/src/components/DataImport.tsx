import { useMatomo } from "@jonkoops/matomo-tracker-react";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { CircularProgress, IconButton } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import { MobileDateRangePicker } from "@mui/x-date-pickers-pro";
import { endOfDay, startOfDay } from "date-fns";
import * as React from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "../context/FormContext";
import { uploadEdfFile } from "../services/httpCalls";
import TooltipModal from "./TooltipModal";

interface Props {
  handleNext: () => void;
}
export default function DataImport({ handleNext }: Readonly<Props>) {
  const { formState, setFormState } = useFormContext();
  const { trackEvent } = useMatomo();

  React.useEffect(() => {
    const explanationOpened = localStorage.getItem(
      "explanation_edf_zip_opened"
    );
    if (explanationOpened !== "true") {
      setOpenToolTipCsv(true);
      localStorage.setItem("explanation_edf_zip_opened", "true");
    }
  }, []);

  React.useEffect(() => {
    setFormState((prevState) => {
      return { ...prevState, isGlobalLoading: false };
    });
  }, [setFormState]);

  const onDrop = async (acceptedFiles: File[]) => {
    formState.isGlobalLoading = true;
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await uploadEdfFile({
          formData,
          start: formState.dateRange[0],
          end: formState.dateRange[1],
          requestId: formState.requestId ?? "",
        });
        if (response) {
          setFormState((prevState) => ({
            ...prevState,
            seasonHourlyAnalysis: response.seasonData,
            analyzedDateRange: response.analyzedDateRange,
            requestId: response.requestId,
            totalConsumption: response.totalConsumption,
            isGlobalLoading: false,
          }));
          handleNext();
        } else {
          alert("Error uploading file.");
        }
      } catch (error) {
        alert("An error occurred during upload.");
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/zip": [".zip"],
    },
    maxFiles: 1,
  });

  const [openTooltipCsv, setOpenToolTipCsv] = React.useState(false);

  const handleTooltipCsvClose = () => {
    setOpenToolTipCsv(false);
  };

  const handleTooltipCsvOpen = () => {
    setOpenToolTipCsv(true);
    trackEvent({ category: "info-upload-data", action: "open" });
  };

  const setRange = (range: [Date, Date]) => {
    setFormState((prevState) => ({
      ...prevState,
      dateRange: range,
    }));
  };

  return (
    <Stack spacing={{ xs: 3, sm: 3 }} useFlexGap>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {!formState.isGlobalLoading && (
          <>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <MobileDateRangePicker
                value={formState.dateRange}
                onAccept={(newValue) => {
                  const start = startOfDay(newValue[0] ?? new Date());
                  const end = endOfDay(newValue[1] ?? new Date());
                  trackEvent({
                    category: "date-range",
                    action: "set",
                    name: `${Math.ceil(
                      Math.abs(
                        new Date(end).getTime() - new Date(start).getTime()
                      ) /
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
            <Alert
              severity="info"
              icon={<InfoRoundedIcon />}
              variant="outlined"
              sx={{
                alignItems: "center",
                width: "100%",
              }}
            >
              Vous pouvez télécharger votre consommation, par pallier de 30
              minutes, sur votre Espace EDF. Le fichier ZIP doit être réimporté
              ici.{" "}
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
        {formState.isGlobalLoading && <CircularProgress />}
      </Box>
    </Stack>
  );
}
