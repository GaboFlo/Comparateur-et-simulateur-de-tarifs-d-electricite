import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { Button, SelectChangeEvent } from "@mui/material";
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
import * as React from "react";
import { ChangeEvent } from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "../context/FormContext";
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
    maxWidth: `calc(50% - ${theme.spacing(1)})`,
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
  /*   const [fullPrmNumbers, setFullPrmNumbers] = React.useState<number[]>([]);
   */
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

  /*  React.useEffect(() => {
    if (formState.consoBorisToken && isValidToken(formState.consoBorisToken)) {
      const fullPrmNumbers = jwtDecode<JwtPayload>(formState.consoBorisToken)
        .sub as unknown as number[];
      setFullPrmNumbers(fullPrmNumbers);
      if (fullPrmNumbers.length === 1) {
        setFormState((prevState) => ({
          ...prevState,
          prmNumber: fullPrmNumbers[0],
        }));
      }
    }
  }); */

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result;
        // eslint-disable-next-line no-console
        console.log(fileContent); // Process the CSV file content here
      };
      reader.readAsText(file);
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

  /*  const isValidToken = (token?: string) => {
    if (!token) return false;
    const parts = token.split(".");
    return parts.length === 3;
  };
 */
  return (
    <Stack spacing={{ xs: 3, sm: 6 }} useFlexGap>
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
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
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
          {/*    <Card selected={formState.importMode === "api"}>
            <CardActionArea
              disabled
              onClick={() =>
                handleChange({
                  target: { name: "importMode", value: "api" },
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
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <CodeRoundedIcon
                  fontSize="small"
                  sx={[
                    (theme) => ({
                      color: "grey.400",
                      ...theme.applyStyles("dark", {
                        color: "grey.600",
                      }),
                    }),
                    formState.importMode === "api" && {
                      color: "primary.main",
                    },
                  ]}
                />
                <Typography sx={{ fontWeight: "medium" }}>
                  Connexion API Enedis (déprécié)
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card> */}
        </RadioGroup>
      </FormControl>
      {formState.importMode === "files" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <ImportContainer>
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
          </ImportContainer>
        </Box>
      )}
      {/*   {formState.importMode === "api" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <ImportContainer>
            <Alert
              severity="warning"
              icon={<WarningRoundedIcon />}
              variant="outlined"
              sx={{ display: "flex", alignItems: "center" }}
            >
              Cette méthode utilise un service tiers, open-source, pour
              récupérer vos données de consommation. <br />
              Pour utiliser cette méthode, vous devez vous connecter sur{" "}
              <a
                href="https://conso.boris.sh/"
                target="_blank"
                rel="noreferrer"
              >
                conso.boris.sh
              </a>{" "}
              et coller votre token ici.
              <Button onClick={handleTooltipCsvOpen}>
                <HelpOutlineIcon sx={{ height: 20 }} />
              </Button>
              <TooltipModal
                title="Comment utiliser l'API Enedis ?"
                description="Rendez-vous sur https://conso.boris.sh/ puis suivez les instructions pour vous connecter sur votre compte Enedis (ou en créer un). 
                <br/> Une fois de retour sur la page de conso.boris, copiez le token et collez le ici."
                open={openTooltipCsv}
                handleClose={handleTooltipCsvClose}
                imgPath="/conso.boris.png"
                imgDescription="Page de création du token"
              />
            </Alert>

            <FormControl variant="outlined" fullWidth>
              <TextField
                id="consoBorisToken"
                name="consoBorisToken"
                label="Token"
                value={formState.consoBorisToken}
                onChange={handleChange}
                variant="outlined"
                placeholder="eyJhb..."
                required
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formState.saveConsoBorisToken}
                  onChange={handleChange}
                  name="saveConsoBorisToken"
                  color="primary"
                />
              }
              label="Enregistrer le token dans mon navigateur pour les prochaines visites"
            />
            <FormControl variant="outlined" fullWidth>
              <FormLabel required>Numéro de compteur</FormLabel>
              <Select
                id="pmrNumber"
                name="pmrNumber"
                value={formState.prmNumber}
                onChange={handleChange}
                required
                size="medium"
                disabled={fullPrmNumbers.length === 1}
              >
                {fullPrmNumbers.map((value: number) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ImportContainer>
        </Box>
      )} */}
    </Stack>
  );
}
