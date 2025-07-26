import { useMatomo } from "@jonkoops/matomo-tracker-react";
import CloseIcon from "@mui/icons-material/Close";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { Stack } from "@mui/system";
import * as React from "react";
import Info from "./Info";

export default function InfoMobile() {
  const [open, setOpen] = React.useState(false);
  const { trackEvent } = useMatomo();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
    newOpen === true &&
      localStorage.setItem("explanation_modal_opened", "true");

    newOpen && trackEvent({ category: "info", action: "open" });
  };

  const DrawerList = (
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
        onClick={toggleDrawer(false)}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
      <Info handleClose={toggleDrawer(false)} />
    </Box>
  );

  return (
    <Stack>
      <Button
        variant="text"
        onClick={toggleDrawer(true)}
        sx={(theme) => ({
          borderRadius: theme.shape.borderRadius,
          border: "1px solid",
          borderColor: theme.palette.divider,
          backgroundColor: theme.palette.background.paper,
        })}
      >
        ℹ️ Comment ça marche ?
      </Button>
      <Drawer open={open} anchor="top" onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </Stack>
  );
}
