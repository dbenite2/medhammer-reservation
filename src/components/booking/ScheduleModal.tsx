import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material"
import dayjs from "dayjs"
import type { Dispatch, SetStateAction } from "react";
import { hourOptionValues, playTimeOptionValues } from "../../utils/Constants";
import { useTranslate } from "../../i18n/useTranslate";

interface Props {
    modalOpen: boolean;
    selectedDate: Date;
    selectedTime: string;
    playTime: number;
    selectedTableId: string;
    handleModalClose: () => void;
    setSelectedTableId: Dispatch<SetStateAction<string>>;
    setPlayTime: Dispatch<SetStateAction<number>>
    setSelectedTime: Dispatch<SetStateAction<string>>;
    tables: any[];
    handleCreateReservation: () => Promise<void>;
}

const ScheduleModal = ({modalOpen, selectedDate, selectedTime, playTime, handleModalClose ,setPlayTime , setSelectedTime, tables, handleCreateReservation, selectedTableId, setSelectedTableId}: Props) => {
    const translate = useTranslate();

    return (
    <Dialog open={modalOpen} onClose={handleModalClose} fullWidth maxWidth="sm">
    <DialogTitle sx={{ pb: 1 }}>
      {translate("reservation.form.title")}
    </DialogTitle>
    <DialogContent sx={{ pt: 1 }}>
      <Stack spacing={2}>
        <Typography variant="h6" component="p">
          {selectedDate ? dayjs(selectedDate).format(translate("reservation.dateFormat")) : ''}
        </Typography>

        <Divider />
      
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>{translate("reservation.form.startTimeLabel")}</InputLabel>
            <Select
              value={selectedTime}
              label={translate("reservation.form.startTimeLabel")}
              onChange={(e) => setSelectedTime(e.target.value)}
            >
                {hourOptionValues.map((value) => (
                  <MenuItem key={value} value={value}>
                    {translate(`reservation.hourOptions.${value}`)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>{translate("reservation.form.playTimeLabel")}</InputLabel>
            <Select
              value={playTime}
              label={translate("reservation.form.playTimeLabel")}
              onChange={(e) => setPlayTime(Number(e.target.value))}
            >
                {playTimeOptionValues.map((value) => (
                  <MenuItem key={value} value={value}>
                    {translate(`reservation.playTimeOptions.${value}`)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>{translate("reservation.form.gameTableLabel")}</InputLabel>
            <Select
              value={selectedTableId}
              label={translate("reservation.form.gameTableLabel")}
              onChange={(e) => setSelectedTableId(e.target.value)}
            >
              {tables.map((table) => (
                <MenuItem key={table.id} value={table.id}>
                  {translate("reservation.tableLabel", { tableNumber: table.table_number })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button variant="contained" color="primary" onClick={handleCreateReservation}>
        {translate("reservation.form.confirmButton")}
      </Button>
    </DialogActions>
  </Dialog>)
}

export default ScheduleModal;
