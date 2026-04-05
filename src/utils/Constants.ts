import type { Option } from "../types";

export const hourOptions: Option[] = [
    {
        label: "6:00 AM",
        value: "06:00"
    },
    {
        label: "7:00 AM",
        value: "07:00"
    },
    {
        label: "8:00 AM",
        value: "08:00"
    },
    {
        label: "9:00 AM",
        value: "09:00"
    },
    {
        label: "10:00 AM",
        value: "10:00"
    },
    {
        label: "11:00 AM",
        value: "11:00"
    },
    {
        label: "12:00 PM",
        value: "12:00"
    },
    {
        label: "1:00 PM",
        value: "13:00"
    },
    {
        label: "2:00 PM",
        value: "14:00"
    },
    {
        label: "3:00 PM",
        value: "15:00"
    },
    {
        label: "4:00 PM",
        value: "16:00"
    },
    {
        label: "5:00 PM",
        value: "17:00"
    },
    {
        label: "6:00 PM",
        value: "18:00"
    },
    {
        label: "7:00 PM",
        value: "19:00"
    },
    {
        label: "8:00 PM",
        value: "20:00"
    },
    {
        label: "9:00 PM",
        value: "21:00"
    },
    {
        label: "10:00 PM",
        value: "22:00"
    },
    {
        label: "11:00 PM",
        value: "23:00"
    },
];

export const playTimesOptions: Option[] = [
    {
        value: 1,
        label: "1H"
    },
    {
        value: 2,
        label: "2H"
    },
    {
        value: 3,
        label: "3H"
    },
    {
        value: 4,
        label: "4H"
    },
    {
        value: 5,
        label: "5H"
    }
];

export const defaultHourOption: Option = {
    label: "6:00 PM",
    value: "18:00"
};

export const defaultPlayTimeOption: Option = {
    label: "1H",
    value: 1,
}

export const lang = {
    es: {
        week: 'Semana',
        work_week: 'Semana de trabajo',
        day: 'Día',
        month: 'Mes',
        previous: 'Anterior',
        next: 'Siguiente',
        today: 'Hoy',
        agenda: 'El Diario',
    
        showMore: (total: any) => `+${total} más`,
    },
}