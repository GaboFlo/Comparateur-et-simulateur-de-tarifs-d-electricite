import { Box, Chip, CircularProgress } from "@mui/material";

interface PeriodChipsProps {
  onLast6Months: () => void;
  onLast12Months: () => void;
  onLast24Months: () => void;
  isLoading?: boolean;
}

export default function PeriodChips({
  onLast6Months,
  onLast12Months,
  onLast24Months,
  isLoading = false,
}: Readonly<PeriodChipsProps>) {
  const chipStyle = {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "primary.50",
    },
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 1,
        flexWrap: "wrap",
        position: "relative",
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 1,
            zIndex: 1,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      <Chip
        label="6 derniers mois"
        onClick={onLast6Months}
        color="primary"
        variant="outlined"
        size="small"
        disabled={isLoading}
        sx={chipStyle}
      />
      <Chip
        label="12 derniers mois"
        onClick={onLast12Months}
        color="primary"
        variant="outlined"
        size="small"
        disabled={isLoading}
        sx={chipStyle}
      />
      <Chip
        label="24 derniers mois"
        onClick={onLast24Months}
        color="primary"
        variant="outlined"
        size="small"
        disabled={isLoading}
        sx={chipStyle}
      />
    </Box>
  );
}
