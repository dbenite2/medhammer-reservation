import { useCallback, useEffect, useState } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import { Dialog, DialogTitle, DialogContent, InputLabel, Select, Button, FormControl, MenuItem, TextField } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../lib/supabase';

// Setup the localizer for the calendar using dayjs
const localizer = dayjsLocalizer(dayjs);

const MasterCalendarView = ()=> {
  const [events, setEvents] = useState<any[]>([]); // Your Supabase data goes here
  const [tables, setTables] = useState<any[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [selectedTime, setSelectedTime] = useState("18:00");
  const [playtime, setPlaytime] = useState(1);
  const [selectedTableId, setSelectedTableId] = useState("");

  useEffect(() => {
    fetchTables();
    fetchReservations();
  }, []);

  const fetchTables = async () => {
    const {data, error} = await supabase.from("game_tables").select("*");
    if (data) setTables(data);
  }

  const fetchReservations = async () => {
    // We join the restaurant_tables to get the table name for the calendar block
    const { data, error } = await supabase
      .from('reservations')
      .select('*, game_tables(table_number)');

    if (error) {
      console.error('Error fetching reservations:', error);
      return;
    }

    if (data) {
      // Format the Supabase data for the calendar
      const formattedEvents = data.map((res) => {
        // Combine date and time strings: "2026-03-15T19:00:00"
        const startDateTime = dayjs(`${res.reservation_date}T${res.start_time}`).toDate();
        // Assuming each reservation is 3 hour for the visual block
        const endDateTime = dayjs(startDateTime).add(res.play_time, 'hour').toDate();
        
        return {
          id: res.id,
          title: `Table ${res.game_tables.table_number} is Booked from ${startDateTime.getHours()}:00 to ${endDateTime.getHours()}:00`,
          start: startDateTime,
          end: endDateTime,
        };
      });
      debugger;
      setEvents(formattedEvents);
    }
  };

  // This fires when a user clicks a day on the calendar
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setIsBookingModalOpen(true);
  };

  const handleCreateReservation = async () => {
    if (!selectedDate || !selectedTableId) return;
    const {data: {user}} = await supabase.auth.getUser();
    if (!user) {
        alert('you are not logged');
        return;
    }
    const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
    const {error} = await supabase.from("reservations").insert([
        {
            user_id: user.id,
            table_id: selectedTableId,
            reservation_date: formattedDate,
            start_time: `${selectedTime}:00`,
            play_time: playtime,
            status: 'confirmed',
        }
    ]);

    if (error) {
        alert(`Booking failed: ${error.message}`);
    } else {
        alert('Reservation successful!');
        setIsBookingModalOpen(false);
        fetchReservations();
    }
  }

  const handleSelectEvent = useCallback((event: any) => window.alert(event.title), []);

  return (
    <div style={{ height: '80vh' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable={true}
        onSelectSlot={handleSelectSlot} // The magic click handler
        views={['month', 'week', 'day']}
        style={{height: '100%'}}
        onSelectEvent={handleSelectEvent}
      />

      {/* The MUI Modal that pops up to make a new reservation */}
      <Dialog open={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          New Reservation: {selectedDate ? dayjs(selectedDate).format('MMMM D, YYYY') : ''}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          
          <FormControl fullWidth>
            <InputLabel>Start Time</InputLabel>
            <Select
              value={selectedTime}
              label="Time"
              onChange={(e) => setSelectedTime(e.target.value)}
            >
                {/* put this into an array of available times */}
              <MenuItem value="18:00">6:00 PM</MenuItem>
              <MenuItem value="19:00">7:00 PM</MenuItem>
              <MenuItem value="20:00">8:00 PM</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Play Time</InputLabel>
            <Select
              value={playtime}
              label="Play Time"
              onChange={(e) => setPlaytime(Number(e.target.value))}
            >
                {/* put this into an array of available times */}
              <MenuItem value={1}>1H</MenuItem>
              <MenuItem value={2}>2H</MenuItem>
              <MenuItem value={3}>3H</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Table</InputLabel>
            <Select
              value={selectedTableId}
              label="Table"
              onChange={(e) => setSelectedTableId(e.target.value)}
            >
              {tables.map((table) => (
                <MenuItem key={table.id} value={table.id}>
                  Table {table.table_number} (Capacity: {table.capacity})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={handleCreateReservation} sx={{ mt: 2 }}>
            Confirm Booking
          </Button>

        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MasterCalendarView;