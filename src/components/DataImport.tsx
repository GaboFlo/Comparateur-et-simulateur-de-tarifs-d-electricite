import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { Button, CircularProgress, SelectChangeEvent } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import MuiCard from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid2";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import JSZip from "jszip";
import * as React from "react";
import { ChangeEvent, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "../context/FormContext";
import { parseCsvToConsumptionLoadCurveData } from "../services/csvParser";
import { ConsumptionLoadCurveData } from "../types";
import TooltipModal from "./TooltipModal";

const Card = styled(MuiCard)<{ selected?: boolean }>(({ theme }) => ({
  border: "1px solid",
  borderColor: theme.palette.divider,
  width: "100%",
  "&:hover": {
    background:
      "linear-gradient(to bottom right, hsla(210, 100%, 97%, 0.5) 25%, hsla(210, 100%, 90%, 0.3) 100%)",
    borderColor: "primary.light",
    boxShadow: "0px 2px 8px hsla(0, 0%, 0%, 0.1)",
    ...theme.applyStyles("dark", {
      background:
        "linear-gradient(to right bottom, hsla(210, 100%, 12%, 0.2) 25%, hsla(210, 100%, 16%, 0.2) 100%)",
      borderColor: "primary.dark",
      boxShadow: "0px 1px 8px hsla(210, 100%, 25%, 0.5) ",
    }),
  },
  [theme.breakpoints.up("md")]: {
    flexGrow: 1,
  },
  variants: [
    {
      props: ({ selected }) => selected,
      style: {
        borderColor: theme.palette.primary.light,
        ...theme.applyStyles("dark", {
          borderColor: theme.palette.primary.dark,
        }),
      },
    },
  ],
}));

const ImportContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  width: "100%",
  height: "auto",
  padding: theme.spacing(3),
  borderRadius: `calc(${theme.shape.borderRadius}px + 4px)`,
  border: "1px solid ",
  borderColor: theme.palette.divider,
  background:
    "linear-gradient(to bottom right, hsla(220, 35%, 97%, 0.3) 25%, hsla(220, 20%, 88%, 0.3) 100%)",
  boxShadow: "0px 4px 8px hsla(210, 0%, 0%, 0.05)",
  [theme.breakpoints.up("xs")]: {
    height: 200,
  },
  [theme.breakpoints.up("sm")]: {
    height: 250,
  },
  ...theme.applyStyles("dark", {
    background:
      "linear-gradient(to right bottom, hsla(220, 30%, 6%, 0.2) 25%, hsla(220, 20%, 25%, 0.2) 100%)",
    boxShadow: "0px 4px 8px hsl(220, 35%, 0%)",
  }),
}));

export default function DataImport() {
  const { formState, setFormState } = useFormContext();
  const [loading, setLoading] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);

  const handleChange = (
    event:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<number>
  ) => {
    const { name, value } = event.target;
    setFormState((prevState) => {
      let newState;
      if (name === "saveConsoBorisToken") {
        newState = { ...prevState, [name]: !prevState.saveConsoBorisToken };
      } else {
        newState = { ...prevState, [name]: value };
      }

      if (newState.saveConsoBorisToken === true) {
        localStorage.setItem("consoBorisToken", newState.consoBorisToken ?? "");
        localStorage.setItem("saveConsoBorisToken", "true");
      } else {
        localStorage.removeItem("consoBorisToken");
        localStorage.removeItem("saveConsoBorisToken");
      }

      return newState;
    });
  };

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
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          aria-label="Type d'import"
          name="importMode"
          value={formState.importMode}
          onChange={handleChange}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
          }}
        >
          <Card selected={formState.importMode === "files"}>
            <CardActionArea
              onClick={() =>
                handleChange({
                  target: { name: "importMode", value: "files" },
                } as ChangeEvent<HTMLInputElement>)
              }
              sx={{
                ".MuiCardActionArea-focusHighlight": {
                  backgroundColor: "transparent",
                },
                "&:focus-visible": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <UploadFileRoundedIcon
                  fontSize="small"
                  sx={[
                    (theme) => ({
                      color: "grey.400",
                      ...theme.applyStyles("dark", {
                        color: "grey.600",
                      }),
                    }),
                    formState.importMode === "files" && {
                      color: "primary.main",
                    },
                  ]}
                />
                <Typography sx={{ fontWeight: "medium" }}>
                  Fichiers EDF
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </RadioGroup>
      </FormControl>
      {formState.importMode === "files" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <ImportContainer>
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
                Fichier CSV extrait avec succès. Vous pouvez maintenant
                continuer.
                <pre>{JSON.stringify(extractedData, null, 2)}</pre>
              </Alert>
            )}
            {parsingError && (
              <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>
                {parsingError}
              </Alert>
            )}
          </ImportContainer>
        </Box>
      )}
    </Stack>
  );
}
