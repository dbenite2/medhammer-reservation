import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import type { AlertColor } from "@mui/material/Alert";
import { useTranslate } from "../../i18n/useTranslate";

interface Props {
  open: boolean;
  severity: AlertColor;
  title: string;
  message: string;
  handleClose: () => void;
}

const InfoModal = ({ open, severity, title, message, handleClose }: Props) => {
  const translate = useTranslate();

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 1 }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Alert severity={severity} variant="outlined">
          {message}
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="contained" color="primary" onClick={handleClose}>
          {translate("feedback.closeButton")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoModal;
