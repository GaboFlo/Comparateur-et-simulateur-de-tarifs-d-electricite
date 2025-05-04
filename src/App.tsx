import { useMatomo } from "@jonkoops/matomo-tracker-react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import { useColorScheme } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CurrentOfferForm from "./components/CurrentOfferForm";
import DataImport from "./components/DataImport";
import Footer from "./components/Footer";
import InfoMobile from "./components/InfoMobile";
import Simulations from "./components/Simulations";
import { DEFAULT_FORM_STATE, useFormContext } from "./context/FormContext";
import { APP_VERSION } from "./types";

const steps = ["Votre offre actuelle", "Votre consommation", "Simulations"];

export default function App() {
  const { formState, setFormState } = useFormContext();
  const { mode, systemMode } = useColorScheme();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const stepParam = query.get("step");
  const { trackPageView, trackEvent } = useMatomo();
  const [activeStep, setActiveStep] = React.useState(
    stepParam ? parseInt(stepParam) : 0
  );

  React.useEffect(() => {
    if (stepParam && parseInt(stepParam) !== activeStep) {
      setActiveStep(parseInt(stepParam));
    }
    if (!formState.seasonHourlyAnalysis && activeStep === 2) {
      handleStepChange(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, stepParam]);

  const handleStepChange = (step: number) => {
    navigate(`?step=${step}`);
  };

  const handleNext = () => {
    handleStepChange(activeStep + 1);
  };

  const handleNextAndTrack = () => {
    handleNext();
    trackEvent({
      category: "form-validation",
      action: "offerType",
      name: formState.offerType.toString(),
    });
    trackEvent({
      category: "form-validation",
      action: "optionType",
      name: formState.optionType.toString(),
    });
    trackEvent({
      category: "form-validation",
      action: "powerClass",
      name: formState.powerClass.toString(),
    });
  };

  function getStepContent(step: number) {
    switch (step) {
      case 0:
        return <CurrentOfferForm handleNext={handleNextAndTrack} />;
      case 1:
        return <DataImport handleNext={handleNext} />;
      case 2:
        return <Simulations />;
      default:
        throw new Error("Unknown step");
    }
  }

  React.useEffect(() => {
    switch (activeStep) {
      case 1:
        document.title =
          "Données de consommation - Simulateur et comparateur de tarifs d'électricité";
        break;
      case 2:
        document.title =
          "Simulations - Simulateur et comparateur de tarifs d'électricité";
        break;
      default:
        document.title =
          "Simulateur et comparateur de tarifs d'électricité selon vos consommations passées, gratuit, immédiat, sans inscription";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  React.useEffect(() => {
    mode &&
      trackPageView({
        customDimensions: [
          {
            id: 1,
            value: APP_VERSION,
          },
          {
            id: 2,
            value: systemMode ?? mode,
          },
        ],
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, mode]);

  return (
    <>
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          zIndex: 12,
        }}
      >
        <InfoMobile />
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
                {steps.map((label, index) => (
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
              {steps.map((label, index) => (
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
                  mb: 1,
                },
                activeStep !== 0
                  ? { justifyContent: "space-between" }
                  : { justifyContent: "flex-end" },
              ]}
            >
              {activeStep !== 0 && (
                <Button
                  startIcon={<ChevronLeftRoundedIcon />}
                  onClick={() => {
                    setFormState(DEFAULT_FORM_STATE);
                    handleStepChange(0);
                  }}
                  variant="text"
                  sx={{ display: { xs: "none", sm: "flex" } }}
                >
                  Recommencer
                </Button>
              )}
            </Box>
            <Footer />
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
