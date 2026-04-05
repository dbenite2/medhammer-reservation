import { Button, Dialog, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import dayjs from "dayjs"
import type { Dispatch, SetStateAction } from "react";
import { hourOptions, playTimesOptions } from "../../utils/Constants";

interface Props {
    modalOpen: boolean;
    selectedDate: Date;
    selectedTime: string;
    playTime: number;
    selectedTableId: string;
    handleModalClose: () => void;
    setSelectedTableId: Dispatch<SetStateAction<string>>;
    setPlayTime: Dispatch<SetStateAction<string | number>>
    setSelectedTime: Dispatch<SetStateAction<string | number>>;
    tables: any[];
    handleCreateReservation: () => Promise<void>;
}

const ScheduleModal = ({modalOpen, selectedDate, selectedTime, playTime, handleModalClose ,setPlayTime , setSelectedTime, tables, handleCreateReservation, selectedTableId, setSelectedTableId}: Props) => {
    return (
    <Dialog open={modalOpen} onClose={handleModalClose} fullWidth maxWidth="sm">
    <DialogTitle>
      New Reservation: {selectedDate ? dayjs(selectedDate).format('MMMM D, YYYY') : ''}
    </DialogTitle>
    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 3}}>
      
      <FormControl sx={{mt: 3}} fullWidth>
        <InputLabel>Start Time</InputLabel>
        <Select
          value={selectedTime}
          label="Start Time"
          onChange={(e) => setSelectedTime(e.target.value)}
        >
            {hourOptions.map((option) => (<MenuItem value={option.value}> {option.label} </MenuItem>))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Play Time</InputLabel>
        <Select
          value={playTime}
          label="Play Time"
          onChange={(e) => setPlayTime(Number(e.target.value))}
        >
            {playTimesOptions.map((option) => (<MenuItem value={option.value}> {option.label} </MenuItem>))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Game Table</InputLabel>
        <Select
          value={selectedTableId}
          label="Game Table"
          onChange={(e) => setSelectedTableId(e.target.value)}
        >
          {tables.map((table) => (
            <MenuItem key={table.id} value={table.id}>
              Table {table.table_number}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" color="primary" onClick={handleCreateReservation} sx={{ mt: 2 }}>
        Confirm Booking
      </Button>

    </DialogContent>
  </Dialog>)
}

export default ScheduleModal;