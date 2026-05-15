import { useCallback, useEffect, useState } from 'react';
import { Calendar, dayjsLocalizer, type View } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../lib/supabase';
import ScheduleModal from '../components/booking/ScheduleModal';
import { defaultHourOption, defaultPlayTimeOption, lang } from '../utils/Constants';

import './Reserve.css';
// Setup the localizer for the calendar using dayjs
const localizer = dayjsLocalizer(dayjs);
type ViewType = View //'month' | 'week' | 'day';
const MasterCalendarView = ()=> {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tables, setTables] = useState<any[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<ViewType>('month');
  const [selectedTime, setSelectedTime] = useState(defaultHourOption.value);
  const [playtime, setPlaytime] = useState(defaultPlayTimeOption.value);
  const [selectedTableId, setSelectedTableId] = useState("");

  useEffect(() => {
    fetchTables();
    fetchReservations();
  }, []);

  const handleModalClose = () => {
    setIsBookingModalOpen(false);
    setSelectedTime(defaultHourOption.value)
    setPlaytime(defaultPlayTimeOption.value);
    setSelectedTableId("");
  }

  const fetchTables = async () => {
    const {data, error} = await supabase.from("game_tables").select("*");
    if (data) {
      const sortedTables = data.sort((a, b) => a.table_number - b.table_number);
      debugger;
      setTables(sortedTables);
    } 
  }

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, game_tables(table_number)');

    if (error) {
      console.error('Error fetching reservations:', error);
      return;
    }

    if (data) {
      const formattedEvents = data.map((res) => {
        const startDateTime = dayjs(`${res.reservation_date}T${res.start_time}`).toDate();
        const endDateTime = dayjs(startDateTime).add(res.play_time, 'hour').toDate();
        
        return {
          id: res.id,
          title: `Table ${res.game_tables.table_number} is Booked from ${startDateTime.getHours()}:00 to ${endDateTime.getHours()}:00`,
          start: startDateTime,
          end: endDateTime,
        };
      });
      setEvents(formattedEvents);
    }
  };


 const handleNavigate = (newDate: Date) => {
   setSelectedDate(newDate);
  }

  // This fires when a user clicks a day on the calendar
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setIsBookingModalOpen(true);
  };

  const handleCreateReservation = async () => {
    if (!selectedDate || !selectedTableId) return;
    debugger;
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
        fetchReservations();
    } else {
        alert('Reservation successful!');
        setIsBookingModalOpen(false);
        fetchReservations();
    }
  }

  const handleSelectEvent = useCallback((event: any) => window.alert(event.title), []);

  return (
    <div style={{ height: '80vh' }} className="rbc-calendar">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable={true}
        date={selectedDate}
        onNavigate={handleNavigate}
        onSelectSlot={handleSelectSlot}
        views={['month', 'week', 'day']}
        view={selectedView}
        onView={setSelectedView}
        style={{height: '100%'}}
        onSelectEvent={handleSelectEvent}
        messages={lang.es}
        culture="es"
      />

      <ScheduleModal modalOpen={isBookingModalOpen} selectedDate={selectedDate} selectedTime={String(selectedTime)} playTime={Number(playtime)} selectedTableId={selectedTableId} setSelectedTableId={setSelectedTableId} setPlayTime={setPlaytime} handleModalClose={handleModalClose} setSelectedTime={setSelectedTime} tables={tables} handleCreateReservation={handleCreateReservation} ></ScheduleModal>

      
    </div>
  );
}

export default MasterCalendarView;