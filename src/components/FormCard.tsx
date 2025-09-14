import { Box, Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";
import * as React from "react";

interface FormCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "highlighted";
  [key: string]: unknown; // Permettre les props supplémentaires
}

const MotionCard = motion.create(Card);

export default function FormCard({
  title,
  subtitle,
  children,
  icon,
  variant = "default",
  ...props
}: Readonly<FormCardProps>) {
  return (
    <MotionCard
      {...props}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        border: "1px solid",
        borderColor: variant === "highlighted" ? "primary.main" : "divider",
        backgroundColor:
          variant === "highlighted" ? "primary.50" : "background.paper",
        boxShadow:
          variant === "highlighted"
            ? "0px 8px 32px rgba(0, 0, 0, 0.12)"
            : "0px 4px 20px rgba(0, 0, 0, 0.08)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            variant === "highlighted"
              ? "0px 12px 40px rgba(0, 0, 0, 0.15)"
              : "0px 8px 32px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 4,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%", // Prendre toute la hauteur disponible
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            mb: 3,
            gap: 2,
            flexShrink: 0, // Empêcher la réduction de taille
          }}
        >
          {icon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor:
                  variant === "highlighted" ? "primary.main" : "primary.50",
                color:
                  variant === "highlighted"
                    ? "primary.contrastText"
                    : "primary.main",
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {icon}
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h5"
              component="h3"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                lineHeight: 1.3,
                mb: subtitle ? 1 : 0,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start", // Aligner en haut
            "& > *": {
              mb: 2,
            },
            "& > *:last-child": {
              mb: 0,
            },
          }}
        >
          {children}
        </Box>
      </CardContent>
    </MotionCard>
  );
}
