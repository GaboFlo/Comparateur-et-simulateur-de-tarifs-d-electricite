import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { Stack } from "@mui/system";
import * as React from "react";
import Info from "./Info";

export default function InfoMobile() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!localStorage.getItem("explanation_modal_opened")) {
      setOpen(true);
      localStorage.setItem("explanation_modal_opened", "true");
    }
  }, []);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: "auto", px: 3, pb: 3, pt: 8 }} role="presentation">
      <IconButton
        onClick={toggleDrawer(false)}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
      <Info />
    </Box>
  );

  return (
    <Stack>
      <Button
        variant="text"
        endIcon={<ExpandMoreRoundedIcon />}
        onClick={toggleDrawer(true)}
      >
        Comment ça marche ?
      </Button>
      <Drawer
        open={open}
        anchor="top"
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            top: "var(--template-frame-height, 0px)",
            backgroundImage: "none",
            backgroundColor: "background.paper",
          },
        }}
      >
        {DrawerList}
      </Drawer>
    </Stack>
  );
}
