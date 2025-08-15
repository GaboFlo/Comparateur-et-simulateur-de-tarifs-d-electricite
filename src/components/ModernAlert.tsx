import CloseIcon from "@mui/icons-material/Close";
import { Alert, AlertProps, Box, IconButton, Typography } from "@mui/material";
import { motion } from "framer-motion";

interface ModernAlertProps extends Omit<AlertProps, "variant"> {
  title?: string;
  description?: string;
  onClose?: () => void;
  variant?: "info" | "success" | "warning" | "error";
  closable?: boolean;
}

export default function ModernAlert({
  title,
  description,
  onClose,
  variant = "info",
  closable = false,
  children,
  sx,
  ...props
}: ModernAlertProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "info":
        return {
          backgroundColor: "#f0f9ff",
          borderColor: "#0ea5e9",
          color: "#0c4a6e",
          "& .MuiAlert-icon": {
            color: "#0ea5e9",
          },
        };
      case "success":
        return {
          backgroundColor: "#f0fdf4",
          borderColor: "#22c55e",
          color: "#14532d",
          "& .MuiAlert-icon": {
            color: "#22c55e",
          },
        };
      case "warning":
        return {
          backgroundColor: "#fffbeb",
          borderColor: "#f59e0b",
          color: "#78350f",
          "& .MuiAlert-icon": {
            color: "#f59e0b",
          },
        };
      case "error":
        return {
          backgroundColor: "#fef2f2",
          borderColor: "#ef4444",
          color: "#7f1d1d",
          "& .MuiAlert-icon": {
            color: "#ef4444",
          },
        };
      default:
        return {};
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <Alert
        variant="outlined"
        severity={variant}
        sx={{
          borderRadius: 2,
          borderWidth: "2px",
          p: 3,
          alignItems: "flex-start",
          position: "relative",
          ...getVariantStyles(),
          ...sx,
        }}
        action={
          closable && onClose ? (
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: "inherit",
                opacity: 0.7,
                "&:hover": {
                  opacity: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : undefined
        }
        {...props}
      >
        <Box sx={{ width: "100%" }}>
          {title && (
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: description ? 1 : 0,
                color: "inherit",
              }}
            >
              {title}
            </Typography>
          )}

          {description && (
            <Typography
              variant="body2"
              sx={{
                color: "inherit",
                opacity: 0.9,
                lineHeight: 1.5,
              }}
            >
              {description}
            </Typography>
          )}

          {children && <Box sx={{ mt: description ? 2 : 0 }}>{children}</Box>}
        </Box>
      </Alert>
    </motion.div>
  );
}
