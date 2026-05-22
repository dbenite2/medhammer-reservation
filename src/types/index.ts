export type Profile = {
    id: string;
    email: string;
    isActive: boolean;
    isEventOrganizer: boolean;
}

export type Option = {
    value: string | number;
    label: string;
};

export type CalendarReservationEvent = {
    id: string;
    title: string;
    userId: string;
    createdByName: string;
    createdByEmail: string;
    tableNumber: string | number;
    start: Date;
    end: Date;
};
