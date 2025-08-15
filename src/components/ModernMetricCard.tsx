import { Box, Card, CardContent, Typography } from "@mui/material";
import { motion } from "framer-motion";
import * as React from "react";

interface ModernMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  variant?: "default" | "highlighted" | "success" | "warning";
  onClick?: () => void;
}

const MotionCard = motion.create(Card);

export default function ModernMetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  onClick,
}: ModernMetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "highlighted":
        return {
          background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
          color: "white",
          "& .MuiTypography-root": {
            color: "white",
          },
        };
      case "success":
        return {
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          color: "white",
          "& .MuiTypography-root": {
            color: "white",
          },
        };
      case "warning":
        return {
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          color: "white",
          "& .MuiTypography-root": {
            color: "white",
          },
        };
      default:
        return {
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        };
    }
  };

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      sx={{
        borderRadius: 3,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        ...getVariantStyles(),
        "&:hover": {
          boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: variant === "default" ? "text.secondary" : "inherit",
                opacity: 0.8,
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: variant === "default" ? "text.primary" : "inherit",
                mb: subtitle ? 1 : 0,
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: variant === "default" ? "text.secondary" : "inherit",
                  opacity: 0.8,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  variant === "default"
                    ? "primary.50"
                    : "rgba(255, 255, 255, 0.2)",
                color: variant === "default" ? "primary.main" : "white",
                fontSize: "1.5rem",
                ml: 2,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        {trend && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 2,
              pt: 2,
              borderTop: "1px solid",
              borderColor:
                variant === "default" ? "divider" : "rgba(255, 255, 255, 0.2)",
            }}
          >
            <Box
              sx={{
                width: 0,
                height: 0,
                borderLeft: "4px solid transparent",
                borderRight: "4px solid transparent",
                borderBottom: trend.isPositive
                  ? "8px solid #22c55e"
                  : "8px solid #ef4444",
                transform: trend.isPositive ? "rotate(0deg)" : "rotate(180deg)",
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: trend.isPositive ? "#22c55e" : "#ef4444",
                fontWeight: 600,
              }}
            >
              {trend.value}%
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: variant === "default" ? "text.secondary" : "inherit",
                opacity: 0.8,
              }}
            >
              {trend.label}
            </Typography>
          </Box>
        )}
      </CardContent>
    </MotionCard>
  );
}
