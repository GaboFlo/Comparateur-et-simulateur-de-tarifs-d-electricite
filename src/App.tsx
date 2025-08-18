import { useMatomo } from "@jonkoops/matomo-tracker-react";
import CloseIcon from "@mui/icons-material/Close";
import { Typography, useColorScheme } from "@mui/material";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CurrentOfferForm from "./components/CurrentOfferForm";
import MyStepper from "./components/Stepper";
import { useFormContext } from "./context/FormContext";
import { APP_VERSION, OfferType, OptionKey } from "./types";

import Analyses from "./components/Analyses";
import DataImport from "./components/DataImport";
import Footer from "./components/Footer";
import Info from "./components/Info";
import Simulations from "./components/Simulations";

//

// Fonction utilitaire pour scroll vers le haut
const scrollToTop = () => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 100);
};

const steps = [
  "Votre offre actuelle",
  "Import de votre consommation",
  "Analyses",
  "Simulations",
];

export default function App() {
  const { mode, systemMode } = useColorScheme();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const stepParam = query.get("step");
  const { trackPageView, trackEvent } = useMatomo();
  const [activeStep, setActiveStep] = React.useState(
    stepParam ? parseInt(stepParam) : 0
  );
  const [openHelpDrawer, setOpenHelpDrawer] = React.useState(false);

  // Vérifier si c'est la première visite et si ce n'est pas un bot
  React.useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");
    const isBot = /bot|crawler|spider|crawling/i.test(navigator.userAgent);

    if (!hasVisitedBefore && !isBot) {
      setOpenHelpDrawer(true);
      localStorage.setItem("hasVisitedBefore", "true");
    }
  }, []);

  // Scroll vers le haut à chaque changement d'étape
  React.useEffect(() => {
    scrollToTop();
  }, [activeStep]);

  const { formState, setFormState } = useFormContext();

  React.useEffect(() => {
    switch (activeStep) {
      case 1:
        document.title =
          "Import de votre consommation - Simulateur et comparateur de tarifs d'électricité";
        break;
      case 2:
        document.title =
          "Analyses - Simulateur et comparateur de tarifs d'électricité";
        break;
      case 3:
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

  const handleStepChange = (step: number) => {
    navigate(`?step=${step}`);
    // Scroll immédiat pour les changements programmatiques
    scrollToTop();
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

  const handleHelpClick = () => {
    setOpenHelpDrawer(true);
    trackEvent({
      category: "help",
      action: "open",
      name: "manual",
    });
  };

  const handleHelpClose = () => {
    setOpenHelpDrawer(false);
  };

  // useEffect pour gérer les changements d'étape et les données
  React.useEffect(() => {
    if (stepParam && parseInt(stepParam) !== activeStep) {
      setActiveStep(parseInt(stepParam));
    }

    // Vérifier si les données de consommation sont disponibles pour les étapes 2 et 3
    if (
      !formState.seasonHourlyAnalysis ||
      formState.seasonHourlyAnalysis.length === 0
    ) {
      if (activeStep === 2 || activeStep === 3) {
        handleStepChange(0);
      }
    }
  }, [activeStep, stepParam, formState.seasonHourlyAnalysis]);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <CurrentOfferForm handleNext={handleNextAndTrack} />;
      case 1:
        return <DataImport handleNext={handleNext} />;
      case 2:
        return <Analyses handleNext={handleNext} />;
      case 3:
        return <Simulations />;
      default:
        return <CurrentOfferForm handleNext={handleNextAndTrack} />;
    }
  };

  return (
    <>
      <CssBaseline enableColorScheme />

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
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <MyStepper
              activeStep={activeStep}
              steps={steps}
              onStepClick={handleStepClick}
              onHelpClick={handleHelpClick}
            />

            <Box
              sx={{
                flex: 1,
                width: "100%",
                maxWidth: "100%",
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              {renderStepContent()}
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Footer onHelpClick={handleHelpClick} />

      <Drawer open={openHelpDrawer} anchor="top" onClose={handleHelpClose}>
        <Box
          sx={{
            width: "auto",
            px: 3,
            pb: 3,
            pt: 8,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", mb: 2, textAlign: "center" }}
          >
            ℹ️ Comment ça marche ?
          </Typography>
          <IconButton
            onClick={handleHelpClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "text.primary",
              backgroundColor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Info handleClose={handleHelpClose} />
        </Box>
      </Drawer>
    </>
  );
}
