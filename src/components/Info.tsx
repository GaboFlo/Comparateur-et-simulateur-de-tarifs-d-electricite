import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { Alert } from "@mui/material";
import Typography from "@mui/material/Typography";
import * as React from "react";

export default function Info() {
  return (
    <React.Fragment>
      <Typography variant="h4" gutterBottom>
        Pourquoi ce site ?
      </Typography>
      <Alert severity="warning" icon={<WarningRoundedIcon />}>
        Les prix affichés ne tiennent pas compte des changements du 01
        Février2025
      </Alert>
      <Typography variant="body1" sx={{ fontWeight: "medium" }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </Typography>
    </React.Fragment>
  );
}
