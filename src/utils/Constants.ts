import dayjs from "dayjs";

export const hourOptionValues = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
] as const;

export const playTimeOptionValues = [1, 2, 3, 4, 5] as const;

export const defaultHourValue: string = "18:00";
export const defaultPlayTimeValue: number = 1;

export const getReservationStart = (date: Date, time: string) => {
    return dayjs(`${dayjs(date).format("YYYY-MM-DD")}T${time}`);
};

export const isReservationDayInPast = (date: Date) => {
    return dayjs(date).endOf("day").isBefore(dayjs());
};

export const isReservationStartInPast = (date: Date, time: string) => {
    return getReservationStart(date, time).isBefore(dayjs());
};

export const getFirstAvailableHour = (date: Date, preferredTime = defaultHourValue) => {
    if (!isReservationStartInPast(date, preferredTime)) return preferredTime;
    return hourOptionValues.find((time) => !isReservationStartInPast(date, time)) ?? null;
};

export const tableLabels = {
    0: 'Mesa garaje 1 - Bastión del Dragón',
    1: 'Mesa garaje 2 - Forja del Martillo',
    2: 'Mesa ventana primer piso - Mirador del Grifo',
    3:  'Mesa escaleras - Paso del Hechicero',
    4: 'Mesa cocina - Taberna del Ogro',
    5: 'Mesa patio - Arena del Coloso',
    6: 'Mesa balcón 1 - Torre del Cuervo',
    7: 'Mesa balcón 2 - Balcón del Fénix',
    8: 'Mesa ventana segundo piso - Atalaya de la Luna',
    9: 'Mesa sobre cocina - Altar de la Forja'
} as const;

type TableLabelKey = keyof typeof tableLabels;

export const getTableDisplayName = (tableNumber: string | number | null | undefined) => {
    if (tableNumber === null || tableNumber === undefined || tableNumber === "") {
        return "";
    }

    const numericTableNumber = Number(tableNumber);

    if (!Number.isNaN(numericTableNumber)) {
        const zeroBasedLabel = tableLabels[(numericTableNumber - 1) as TableLabelKey];
        if (zeroBasedLabel) return zeroBasedLabel;

        const directLabel = tableLabels[numericTableNumber as TableLabelKey];
        if (directLabel) return directLabel;
    }

    return `Mesa ${tableNumber}`;
};
