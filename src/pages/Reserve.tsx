import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, dayjsLocalizer, type View } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { User } from '@supabase/supabase-js';
import type { AlertColor } from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ScheduleModal from '../components/booking/ScheduleModal';
import { defaultHourValue, defaultPlayTimeValue, hourOptionValues } from '../utils/Constants';

import './Reserve.css';
import NotificationModal from '../components/booking/NotificationModal';
import UserMenu from '../components/auth/UserMenu';
import type { CalendarReservationEvent } from '../types';
import { useTranslate } from '../i18n/useTranslate';
import InfoModal from '../components/common/InfoModal';
// Setup the localizer for the calendar using dayjs
const localizer = dayjsLocalizer(dayjs);
type ViewType = View //'month' | 'week' | 'day';

type FeedbackModalState = {
  open: boolean;
  severity: AlertColor;
  title: string;
  message: string;
};

const closedFeedbackModal: FeedbackModalState = {
  open: false,
  severity: 'info',
  title: '',
  message: '',
};

const getUserDisplayName = (user: User, fallback: string) => {
  const metadata = user.user_metadata ?? {};
  const metadataName = metadata.full_name || metadata.name || metadata.preferred_name || metadata.user_name;

  if (typeof metadataName === 'string' && metadataName.trim()) {
    return metadataName.trim();
  }

  return user.email?.split('@')[0] || fallback;
};

const MasterCalendarView = ()=> {
  const translate = useTranslate();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarReservationEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tables, setTables] = useState<any[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<ViewType>('month');
  const [selectedTime, setSelectedTime] = useState<string>(defaultHourValue);
  const [playtime, setPlaytime] = useState<number>(defaultPlayTimeValue);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<CalendarReservationEvent | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [cancelingReservation, setCancelingReservation] = useState(false);
  const [creatingReservation, setCreatingReservation] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>(closedFeedbackModal);

  const getFeedbackTitle = useCallback((severity: AlertColor) => {
    if (severity === 'success') return translate("feedback.successTitle");
    if (severity === 'error') return translate("feedback.errorTitle");
    if (severity === 'warning') return translate("feedback.warningTitle");
    return translate("feedback.infoTitle");
  }, [translate]);

  const showFeedbackModal = useCallback((severity: AlertColor, message: string) => {
    setFeedbackModal({
      open: true,
      severity,
      title: getFeedbackTitle(severity),
      message,
    });
  }, [getFeedbackTitle]);

  const handleFeedbackModalClose = () => {
    setFeedbackModal(closedFeedbackModal);
  };

  const currentUserReservations = useMemo(() => {
    if (!currentUserId) return [];

    return events.filter((event) => event.userId === currentUserId && dayjs(event.end).isAfter(dayjs()));
  }, [currentUserId, events]);

  const calendarMessages = useMemo(() => ({
    date: translate("calendar.date"),
    time: translate("calendar.time"),
    event: translate("calendar.event"),
    allDay: translate("calendar.allDay"),
    week: translate("calendar.week"),
    work_week: translate("calendar.workWeek"),
    day: translate("calendar.day"),
    month: translate("calendar.month"),
    previous: translate("calendar.previous"),
    next: translate("calendar.next"),
    yesterday: translate("calendar.yesterday"),
    tomorrow: translate("calendar.tomorrow"),
    today: translate("calendar.today"),
    agenda: translate("calendar.agenda"),
    noEventsInRange: translate("calendar.noEventsInRange"),
    showMore: (total: number) => translate("calendar.showMore", { total }),
  }), [translate]);

  const handleModalClose = () => {
    setIsBookingModalOpen(false);
    setSelectedTime(defaultHourValue)
    setPlaytime(defaultPlayTimeValue);
    setSelectedTableId("");
  }

  const fetchTables = useCallback(async () => {
    const {data, error} = await supabase.from("game_tables").select("*");
    if (error) {
      console.error(translate("reservation.logs.fetchTablesError"), error);
      return;
    }

    if (data) {
      const sortedTables = data.sort((a, b) => a.table_number - b.table_number);
      setTables(sortedTables);
    } 
  }, [translate]);

  const fetchCurrentUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);
  }, []);

  const fetchReservations = useCallback(async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, game_tables(table_number)')
      .or('status.is.null,status.neq.cancelled');

    if (error) {
      console.error(translate("reservation.logs.fetchReservationsError"), error);
      return;
    }

    if (data) {
      const formattedEvents: CalendarReservationEvent[] = data.map((res) => {
        const startDateTime = dayjs(`${res.reservation_date}T${res.start_time}`).toDate();
        const endDateTime = dayjs(startDateTime).add(res.play_time, 'hour').toDate();
        const tableNumber = res.game_tables?.table_number ?? '';
        const createdByName = res.created_by_name || res.created_by_email || translate("reservation.unknownUser");
        const createdByEmail = res.created_by_email || '';

        return {
          id: res.id,
          title: translate("reservation.eventTitleWithUser", { userName: createdByName }),
          userId: res.user_id,
          createdByName,
          createdByEmail,
          tableNumber,
          start: startDateTime,
          end: endDateTime,
        };
      });
      setEvents(formattedEvents);
    }
  }, [translate]);

  useEffect(() => {
    fetchCurrentUser();
    fetchTables();
    fetchReservations();
  }, [fetchCurrentUser, fetchTables, fetchReservations]);


 const handleNavigate = (newDate: Date) => {
   setSelectedDate(newDate);
  }

  // This fires when a user clicks a day on the calendar
  const handleSelectSlot = async ({ start }: { start: Date }) => {
    if (!currentUserId) {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        showFeedbackModal('warning', translate("reservation.alerts.signInToCreate"));
        return;
      }

      setCurrentUserId(user.id);
    }

    const selectedHour = dayjs(start).format("HH:00");
    const hourOption = hourOptionValues.find((value) => value === selectedHour);

    setSelectedDate(start);
    setSelectedTime(hourOption ?? defaultHourValue);
    setIsBookingModalOpen(true);
  };

  const handleCreateReservation = async () => {
    if (!selectedDate || !selectedTableId) {
        showFeedbackModal('warning', translate("reservation.alerts.selectTable"));
        return;
    }

    setCreatingReservation(true);

    try {
      const {data: {user}} = await supabase.auth.getUser();
      if (!user) {
          showFeedbackModal('warning', translate("reservation.alerts.notLoggedIn"));
          return;
      }
      setCurrentUserId(user.id);

      const createdByName = getUserDisplayName(user, translate("reservation.unknownUser"));
      const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
      const {error} = await supabase.from("reservations").insert([
          {
              user_id: user.id,
              table_id: selectedTableId,
              created_by_name: createdByName,
              created_by_email: user.email,
              reservation_date: formattedDate,
              start_time: `${selectedTime}:00`,
              play_time: playtime,
              status: 'confirmed',
          }
      ]);

      if (error) {
          console.error(translate("reservation.logs.createReservationError"), error);
          showFeedbackModal('error', translate("reservation.alerts.createFailed"));
          await fetchReservations();
          return;
      }

      showFeedbackModal('success', translate("reservation.alerts.createSuccess"));
      handleModalClose();
      await fetchReservations();
    } finally {
      setCreatingReservation(false);
    }
  }

  const handleSelectEvent = useCallback((event: CalendarReservationEvent) => {
    setSelectedReservation(event);
    setIsNotificationModalOpen(true);
  }, []);

  const handleNotificationModalClose = () => {
    setIsNotificationModalOpen(false);
    setSelectedReservation(null);
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== selectedReservation.userId) {
      showFeedbackModal('warning', translate("reservation.alerts.cancelNotAllowed"));
      return;
    }

    setCancelingReservation(true);

    const { data, error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', selectedReservation.id)
      .eq('user_id', user.id)
      .select('id');

    setCancelingReservation(false);

    if (error || !data?.length) {
      console.error(translate("reservation.logs.cancelReservationError"), error);
      showFeedbackModal('error', translate("reservation.alerts.cancelFailed"));
      return;
    }

    showFeedbackModal('success', translate("reservation.alerts.cancelSuccess"));
    handleNotificationModalClose();
    await fetchReservations();
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUserId(null);
    setSelectedReservation(null);
    setIsNotificationModalOpen(false);
  };

  return (
    <div style={{ height: '100vh', width: '100%' }} className="rbc-calendar">
      <UserMenu
        isSignedIn={Boolean(currentUserId)}
        reservations={currentUserReservations}
        handleSignIn={handleSignIn}
        handleSignOut={handleSignOut}
      />

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
        messages={calendarMessages}
        culture="es"
      />

      <ScheduleModal
        modalOpen={isBookingModalOpen}
        selectedDate={selectedDate}
        selectedTime={String(selectedTime)}
        playTime={Number(playtime)}
        selectedTableId={selectedTableId}
        setSelectedTableId={setSelectedTableId}
        setPlayTime={setPlaytime}
        handleModalClose={handleModalClose}
        setSelectedTime={setSelectedTime}
        tables={tables}
        handleCreateReservation={handleCreateReservation}
        creatingReservation={creatingReservation}
      />

      <NotificationModal
        modalOpen={isNotificationModalOpen}
        reservation={selectedReservation}
        canCancelReservation={Boolean(selectedReservation && currentUserId === selectedReservation.userId)}
        cancelingReservation={cancelingReservation}
        handleCancelReservation={handleCancelReservation}
        handleModalClose={handleNotificationModalClose}
      />

      <InfoModal
        open={feedbackModal.open}
        severity={feedbackModal.severity}
        title={feedbackModal.title}
        message={feedbackModal.message}
        handleClose={handleFeedbackModalClose}
      />
      
    </div>
  );
}

export default MasterCalendarView;
