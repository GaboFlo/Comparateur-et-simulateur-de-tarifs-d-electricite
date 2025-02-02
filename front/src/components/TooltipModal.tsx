import CloseIcon from "@mui/icons-material/Close";
import {
  Backdrop,
  Box,
  Fade,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";

interface Props {
  title: string;
  description?: string;
  open: boolean;
  handleClose: () => void;
  imgPath?: string;
  imgDescription?: string;
}

export default function TooltipModal({
  title,
  description,
  handleClose,
  open,
  imgPath,
  imgDescription,
}: Readonly<Props>) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
    maxWidth: "90%",
  };

  const linkifiedDescription = description?.replace(
    /(https:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 1000,
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography id="modal-modal-title" variant="h5" component="h2">
              {title}
            </Typography>
            {description && linkifiedDescription && (
              <Typography
                id="modal-modal-description"
                sx={{ mt: 2 }}
                dangerouslySetInnerHTML={{ __html: linkifiedDescription }}
              />
            )}
            <img
              src={imgPath}
              alt={imgDescription}
              style={{
                marginTop: "16px",
                maxHeight: "300px",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
                maxWidth: "80%",
              }}
            />
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
