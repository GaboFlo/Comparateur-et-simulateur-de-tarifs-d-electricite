import { useMatomo } from "@jonkoops/matomo-tracker-react";
import { useColorScheme } from "@mui/material";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import * as React from "react";
import { lazy } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "./components/Footer";
import InfoMobile from "./components/InfoMobile";
import ModernCurrentOfferForm from "./components/ModernCurrentOfferForm";
import ModernDataImport from "./components/ModernDataImport";
import ModernStepper from "./components/ModernStepper";
import { useFormContext } from "./context/FormContext";
import { APP_VERSION, OfferType, OptionKey } from "./types";

const Simulations = lazy(() => import("./components/Simulations"));

const steps = ["Votre offre actuelle", "Votre consommation", "Simulations"];

export default function ModernApp() {
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
      console.log(stepParam, activeStep);
      setActiveStep(parseInt(stepParam));
    }

    // Vérifier si les données de consommation sont disponibles pour l'étape 3
    if (
      !formState.seasonHourlyAnalysis ||
      formState.seasonHourlyAnalysis.length === 0
    ) {
      if (activeStep === 2) {
        console.log(formState);
        handleStepChange(0);
      }
    }

    if (activeStep === 0) {
      import("./components/ModernDataImport");
    }
    if (activeStep === 1) {
      import("./components/Simulations");
    }
  }, [activeStep, stepParam, formState.seasonHourlyAnalysis]);

  // Scroll vers le haut à chaque changement d'étape
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStep]);

  const handleStepChange = (step: number) => {
    navigate(`?step=${step}`);
  };

  const handleStepClick = (stepIndex: number) => {
    // Si on clique sur l'étape 1 (index 0), nettoyer le state et retourner à l'étape 0
    if (stepIndex === 0) {
      // Nettoyer le state en gardant seulement les valeurs par défaut
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
    }
    handleStepChange(stepIndex);
  };

  const handleNext = () => {
    console.log("handleNext", activeStep);
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
  }, [activeStep, mode, trackPageView, systemMode]);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <ModernCurrentOfferForm handleNext={handleNextAndTrack} />;
      case 1:
        return <ModernDataImport handleNext={handleNext} />;
      case 2:
        return <Simulations />;
      default:
        return <ModernCurrentOfferForm handleNext={handleNextAndTrack} />;
    }
  };

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
          minHeight: {
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
              flexDirection: "column",
              width: "100%",
              maxWidth: "1200px",
              mx: "auto",
            }}
          >
            <ModernStepper
              activeStep={activeStep}
              steps={steps}
              onStepClick={handleStepClick}
            />

            <Box
              sx={{
                flex: 1,
                width: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {renderStepContent()}
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Footer />
    </>
  );
}
