import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid2";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import * as React from "react";
import CurrentOfferForm from "./components/CurrentOfferForm";
import DataImport from "./components/DataImport";
import DatePickers from "./components/DatePickers";
import Info from "./components/Info";
import InfoMobile from "./components/InfoMobile";
import { useFormContext } from "./context/FormContext";
import AppTheme from "./theme/AppTheme";
import ColorModeIconDropdown from "./theme/ColorModeIconDropdown";

const steps = [
  "Votre offre actuelle",
  "Votre consommation",
  "Période de simulation",
  "Simulations",
];

export default function Checkout(props: { disableCustomTheme?: boolean }) {
  const { formState } = useFormContext();

  const [activeStep, setActiveStep] = React.useState(0);
  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return <CurrentOfferForm />;
      case 1:
        return <DataImport handleNext={handleNext} />;
      case 2:
        return <DatePickers />;
      case 3:
        return <Typography variant="h2">Simulations</Typography>;
      default:
        throw new Error("Unknown step");
    }
  }

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ position: "fixed", top: "1rem", right: "1rem" }}>
        <ColorModeIconDropdown />
      </Box>

      <Grid
        container
        sx={{
          height: {
            xs: "100%",
            sm: "calc(100dvh - var(--template-frame-height, 0px))",
          },
          mt: {
            xs: 4,
            sm: 0,
          },
        }}
      >
        <Grid
          size={{ xs: 12, sm: 4, lg: 3 }}
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            backgroundColor: "background.paper",
            borderRight: { sm: "none", md: "1px solid" },
            borderColor: { sm: "none", md: "divider" },
            alignItems: "start",
            pt: 10,
            px: 5,
            gap: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              width: "100%",
              maxWidth: 600,
            }}
          >
            <Info />
          </Box>
        </Grid>
        <Grid
          size={{ sm: 12, md: 8, lg: 9 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",
            width: "100%",
            backgroundColor: { xs: "transparent", sm: "background.default" },
            alignItems: "start",
            pt: { xs: 0, sm: 6 },
            px: { xs: 2, sm: 6 },
            gap: { xs: 4, md: 4 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: { sm: "space-between", md: "flex-end" },
              alignItems: "center",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexGrow: 1,
              }}
            >
              <Stepper
                id="desktop-stepper"
                activeStep={activeStep}
                sx={{ width: "100%", height: 40 }}
              >
                {steps.map((label) => (
                  <Step
                    sx={{ ":first-child": { pl: 0 }, ":last-child": { pr: 0 } }}
                    key={label}
                  >
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>
          <Card sx={{ display: { xs: "flex", md: "none" }, width: "100%" }}>
            <CardContent
              sx={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <InfoMobile />
            </CardContent>
          </Card>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              width: "100%",
              maxHeight: "720px",
              gap: { xs: 5, md: "none" },
            }}
          >
            <Stepper
              id="mobile-stepper"
              activeStep={activeStep}
              alternativeLabel
              sx={{ display: { sm: "flex", md: "none" } }}
            >
              {steps.map((label) => (
                <Step
                  sx={{
                    ":first-child": { pl: 0 },
                    ":last-child": { pr: 0 },
                    "& .MuiStepConnector-root": { top: { xs: 6, sm: 12 } },
                  }}
                  key={label}
                >
                  <StepLabel
                    sx={{
                      ".MuiStepLabel-labelContainer": { maxWidth: "70px" },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {getStepContent(activeStep)}
            <Box
              sx={[
                {
                  display: "flex",
                  flexDirection: { xs: "column-reverse", sm: "row" },
                  alignItems: "end",
                  flexGrow: 1,
                  gap: 1,
                  pb: { xs: 12, sm: 0 },
                  mt: { xs: 2, sm: 0 },
                  mb: "60px",
                },
                activeStep !== 0
                  ? { justifyContent: "space-between" }
                  : { justifyContent: "flex-end" },
              ]}
            >
              {activeStep !== 0 && (
                <Button
                  startIcon={<ChevronLeftRoundedIcon />}
                  onClick={handleBack}
                  variant="text"
                  sx={{ display: { xs: "none", sm: "flex" } }}
                >
                  Précédent
                </Button>
              )}

              {activeStep !== steps.length - 1 && !formState.disableNext && (
                <Button
                  variant="contained"
                  endIcon={<ChevronRightRoundedIcon />}
                  onClick={handleNext}
                  sx={{ width: { xs: "100%", sm: "fit-content" } }}
                >
                  {activeStep === steps.length - 2
                    ? "Lancer la simulation"
                    : "Suivant"}
                </Button>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}
