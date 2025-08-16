import {
  Button,
  ButtonProps,
  CircularProgress,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import * as React from "react";

interface ActionButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function ActionButton({
  variant = "primary",
  loading = false,
  icon,
  children,
  disabled,
  sx,
  ...props
}: ActionButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          color: "white",
          border: "none",
          "&:hover": {
            background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
            transform: "translateY(-2px)",
            boxShadow: "0px 8px 25px rgba(25, 118, 210, 0.4)",
          },
          "&:focus": {
            outline: "2px solid #1976d2",
            outlineOffset: "2px",
          },
        };
      case "secondary":
        return {
          background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
          color: "white",
          border: "none",
          "&:hover": {
            background: "linear-gradient(135deg, #475569 0%, #334155 100%)",
            transform: "translateY(-2px)",
            boxShadow: "0px 8px 25px rgba(100, 116, 139, 0.3)",
          },
        };
      case "outline":
        return {
          background: "transparent",
          color: "#1976d2",
          border: "2px solid #1976d2",
          "&:hover": {
            background: "#1976d2",
            color: "white",
            transform: "translateY(-2px)",
            boxShadow: "0px 8px 25px rgba(25, 118, 210, 0.3)",
          },
          "&:focus": {
            outline: "2px solid #1976d2",
            outlineOffset: "2px",
          },
        };
      case "ghost":
        return {
          background: "transparent",
          color: "#64748b",
          border: "1px solid #e2e8f0",
          "&:hover": {
            background: "#f8fafc",
            borderColor: "#cbd5e1",
            transform: "translateY(-1px)",
          },
        };
      default:
        return {};
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        variant="contained"
        disabled={disabled || loading}
        sx={{
          borderRadius: 2,
          padding: "12px 24px",
          fontSize: "0.875rem",
          fontWeight: 700,
          textTransform: "none",
          transition: "all 0.2s ease-in-out",
          minHeight: 48,
          position: "relative",
          overflow: "hidden",
          ...getVariantStyles(),
          ...sx,
          "&:disabled": {
            opacity: 0.6,
            transform: "none !important",
          },
          "&:focus-visible": {
            outline: "2px solid #1976d2",
            outlineOffset: "2px",
          },
        }}
        {...props}
      >
        {loading && (
          <CircularProgress
            size={20}
            sx={{
              color: variant === "outline" ? "#1976d2" : "white",
              mr: 1,
            }}
          />
        )}

        {icon && !loading && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            style={{ marginRight: 8, display: "flex", alignItems: "center" }}
          >
            {icon}
          </motion.div>
        )}

        <Typography
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: "0.875rem",
            color: variant === "primary" ? "white" : "inherit",
            textShadow:
              variant === "primary" ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
          }}
        >
          {children}
        </Typography>
      </Button>
    </motion.div>
  );
}
