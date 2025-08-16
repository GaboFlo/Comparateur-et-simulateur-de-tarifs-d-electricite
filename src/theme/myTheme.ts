import { createTheme, ThemeOptions } from "@mui/material/styles";

// Palette de couleurs e et sobre - Respectant les normes RGAA
const Colors = {
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
};

export const Theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: Colors.primary[600],
      light: Colors.primary[400],
      dark: Colors.primary[800],
      contrastText: "#ffffff",
    },
    secondary: {
      main: Colors.neutral[600],
      light: Colors.neutral[400],
      dark: Colors.neutral[800],
      contrastText: "#ffffff",
    },
    success: {
      main: Colors.success[600],
      light: Colors.success[400],
      dark: Colors.success[800],
      contrastText: "#ffffff",
    },
    warning: {
      main: Colors.warning[600],
      light: Colors.warning[400],
      dark: Colors.warning[800],
      contrastText: "#ffffff",
    },
    error: {
      main: Colors.error[600],
      light: Colors.error[400],
      dark: Colors.error[800],
      contrastText: "#ffffff",
    },
    grey: Colors.neutral,
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: Colors.neutral[900],
      secondary: Colors.neutral[600],
    },
    divider: Colors.neutral[200],
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
      color: Colors.neutral[900],
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
      color: Colors.neutral[900],
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: Colors.neutral[900],
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: Colors.neutral[900],
    },
    h5: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: Colors.neutral[900],
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.4,
      color: Colors.neutral[900],
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      color: Colors.neutral[700],
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
      color: Colors.neutral[600],
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 1px 2px rgba(0, 0, 0, 0.05)",
    "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
    "0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)",
    "0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)",
    "0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
    "0px 25px 50px rgba(0, 0, 0, 0.15)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          fontSize: "0.875rem",
          fontWeight: 600,
          textTransform: "none",
          transition: "all 0.2s ease-in-out",
          minHeight: 44, // Taille minimale pour l'accessibilité
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
          },
          "&:focus": {
            outline: `2px solid ${Colors.primary[600]}`,
            outlineOffset: "2px",
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${Colors.primary[600]} 0%, ${Colors.primary[700]} 100%)`,
          "&:hover": {
            background: `linear-gradient(135deg, ${Colors.primary[700]} 0%, ${Colors.primary[800]} 100%)`,
          },
        },
        outlined: {
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${Colors.neutral[200]}`,
          boxShadow:
            "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow:
              "0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)",
            transform: "translateY(-2px)",
          },
          "&:focus-within": {
            outline: `2px solid ${Colors.primary[600]}`,
            outlineOffset: "2px",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            transition: "all 0.2s ease-in-out",
            minHeight: 44, // Taille minimale pour l'accessibilité
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: Colors.primary[400],
              },
            },
            "&.Mui-focused": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: Colors.primary[600],
                borderWidth: "2px",
              },
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 44, // Taille minimale pour l'accessibilité
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          "& .MuiStepLabel-root": {
            "& .MuiStepLabel-label": {
              fontSize: "0.875rem",
              fontWeight: 500,
            },
          },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          "&.Mui-active": {
            color: Colors.primary[600],
          },
          "&.Mui-completed": {
            color: Colors.success[600],
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: "none",
          "& .MuiAlert-message": {
            color: "inherit",
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 44, // Taille minimale pour l'accessibilité
          "&:focus": {
            backgroundColor: `${Colors.primary[50]} !important`,
            outline: `2px solid ${Colors.primary[600]}`,
            outlineOffset: "-2px",
          },
        },
      },
    },
  },
} as ThemeOptions);
