import { Box, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { motion } from "framer-motion";

interface StepperProps {
  activeStep: number;
  steps: string[];
  onStepClick?: (stepIndex: number) => void;
}

const MotionBox = motion.create(Box);

export default function MyStepper({
  activeStep,
  steps,
  onStepClick,
}: StepperProps) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        width: "100%",
        mb: 4,
        p: 3,
        backgroundColor: "background.paper",
        borderRadius: 3,
        boxShadow:
          "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          textAlign: "center",
          fontWeight: 600,
          color: "text.primary",
        }}
      >
        Progression de votre simulation
      </Typography>

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
                    width: 40,
                    height: 40,
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
