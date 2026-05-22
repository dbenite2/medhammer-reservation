import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import type { CalendarReservationEvent } from "../../types";
import { useTranslate } from "../../i18n/useTranslate";

interface Props {
    reservation: CalendarReservationEvent | null;
    modalOpen: boolean;
    canCancelReservation: boolean;
    cancelingReservation: boolean;
    handleCancelReservation: () => void;
    handleModalClose: () => void;
}

const NotificationModal = ({reservation, modalOpen, canCancelReservation, cancelingReservation, handleCancelReservation, handleModalClose}: Props) => {
    const translate = useTranslate();
    const formattedDate = reservation ? dayjs(reservation.start).format(translate("reservation.dateFormat")) : "";
    const startTime = reservation ? dayjs(reservation.start).format(translate("reservation.timeFormat")) : "";
    const endTime = reservation ? dayjs(reservation.end).format(translate("reservation.timeFormat")) : "";
    const durationInMinutes = reservation ? dayjs(reservation.end).diff(reservation.start, "minute") : 0;
    const durationLabel = durationInMinutes >= 60
        ? translate("reservation.duration.hours", { hours: durationInMinutes / 60 })
        : translate("reservation.duration.minutes", { minutes: durationInMinutes });
    const tableLabel = reservation?.tableNumber
        ? translate("reservation.tableLabel", { tableNumber: reservation.tableNumber })
        : translate("reservation.notification.fallbackTitle");

    return (
      <Dialog open={modalOpen && Boolean(reservation)} onClose={handleModalClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1 }}>
          {translate("reservation.notification.title")}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2}>
            <Typography variant="h6" component="p">
              {tableLabel}
            </Typography>
            <Typography color="text.secondary">
              {translate("reservation.notification.reservedMessage")}
            </Typography>
            <Divider />
            <Stack spacing={1}>
              <Typography>
                <strong>{translate("reservation.notification.dateLabel")}:</strong> {formattedDate}
              </Typography>
              <Typography>
                <strong>{translate("reservation.notification.startLabel")}:</strong> {startTime}
              </Typography>
              <Typography>
                <strong>{translate("reservation.notification.endLabel")}:</strong> {endTime}
              </Typography>
              <Typography>
                <strong>{translate("reservation.notification.durationLabel")}:</strong> {durationLabel}
              </Typography>
              <Typography>
                <strong>{translate("reservation.notification.ownerLabel")}:</strong> {reservation?.createdByName}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {canCancelReservation && (
            <Button
              variant="outlined"
              color="error"
              disabled={cancelingReservation}
              onClick={handleCancelReservation}
            >
              {cancelingReservation
                ? translate("reservation.notification.cancelingButton")
                : translate("reservation.notification.cancelButton")}
            </Button>
          )}
          <Button variant="contained" color="primary" onClick={handleModalClose}>
            {translate("reservation.notification.closeButton")}
          </Button>
        </DialogActions>
      </Dialog>
    );
}

export default NotificationModal;
