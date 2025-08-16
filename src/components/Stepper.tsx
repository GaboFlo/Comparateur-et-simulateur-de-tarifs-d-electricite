import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Box,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

interface StepperProps {
  activeStep: number;
  steps: string[];
  onStepClick?: (stepIndex: number) => void;
  onHelpClick?: () => void;
}

const MotionBox = motion.create(Box);

export default function MyStepper({
  activeStep,
  steps,
  onStepClick,
  onHelpClick,
}: StepperProps) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        width: "100%",
        mb: 3,
        p: 1,
        backgroundColor: "background.paper",
        borderRadius: 3,
        boxShadow:
          "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: 400,
            color: "primary.main",
            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
          }}
        >
          Simulateur de tarifs d'électricité
        </Typography>
        {onHelpClick && (
          <IconButton
            onClick={onHelpClick}
            size="small"
            sx={{
              ml: 1,
              color: "primary.main",
              opacity: 0.7,
              "&:hover": {
                opacity: 1,
                backgroundColor: "primary.50",
              },
            }}
          >
            <HelpOutlineIcon />
          </IconButton>
        )}
      </Box>

      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          "& .MuiStepLabel-root": {
            "& .MuiStepLabel-label": {
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "text.secondary",
              "&.Mui-active": {
                color: "primary.main",
                fontWeight: 600,
              },
              "&.Mui-completed": {
                color: "success.main",
                fontWeight: 600,
              },
            },
          },
          "& .MuiStepConnector-root": {
            "& .MuiStepConnector-line": {
              borderColor: "divider",
              borderTopWidth: 2,
            },
          },
          "& .MuiStepConnector-root.Mui-active": {
            "& .MuiStepConnector-line": {
              borderColor: "primary.main",
            },
          },
          "& .MuiStepConnector-root.Mui-completed": {
            "& .MuiStepConnector-line": {
              borderColor: "success.main",
            },
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              onClick={() => onStepClick?.(index)}
              sx={{
                cursor: onStepClick ? "pointer" : "default",
                "&:hover": onStepClick
                  ? {
                      opacity: 0.8,
                    }
                  : {},
              }}
              StepIconComponent={({ active, completed, icon }) => (
                <MotionBox
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "white",
                    backgroundColor: completed
                      ? "success.main"
                      : active
                      ? "primary.main"
                      : "grey.300",
                    boxShadow:
                      active || completed
                        ? "0px 4px 12px rgba(0, 0, 0, 0.15)"
                        : "none",
                    transition: "all 0.3s ease-in-out",
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {completed ? "✓" : icon}
                </MotionBox>
              )}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: activeStep === index ? 600 : 400,
                  color:
                    activeStep === index ? "primary.main" : "text.secondary",
                }}
              >
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        sx={{
          mt: 2,
          textAlign: "center",
        }}
      />
    </MotionBox>
  );
}
