import { useMemo, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import type { CalendarReservationEvent } from "../../types";
import { useTranslate } from "../../i18n/useTranslate";

interface Props {
    isSignedIn: boolean;
    reservations: CalendarReservationEvent[];
    handleSignIn: () => void;
    handleSignOut: () => Promise<void>;
}

const UserMenu = ({ isSignedIn, reservations, handleSignIn, handleSignOut }: Props) => {
    const translate = useTranslate();
    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const [reservationsOpen, setReservationsOpen] = useState(false);

    const sortedReservations = useMemo(() => {
        return [...reservations].sort((first, second) => first.start.getTime() - second.start.getTime());
    }, [reservations]);

    const closeMenu = () => setAnchorElement(null);

    const openReservations = () => {
        closeMenu();
        setReservationsOpen(true);
    };

    const signOut = async () => {
        closeMenu();
        await handleSignOut();
    };

    const signIn = () => {
        closeMenu();
        handleSignIn();
    };

    return (
        <div className="user-menu-container">
            <IconButton
                className="user-menu-button"
                aria-label={translate("userMenu.openMenuLabel")}
                aria-controls={anchorElement ? "user-menu" : undefined}
                aria-expanded={anchorElement ? "true" : undefined}
                aria-haspopup="true"
                onClick={(event) => setAnchorElement(event.currentTarget)}
            >
                <span className="user-menu-icon" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </span>
            </IconButton>

            <Menu
                id="user-menu"
                anchorEl={anchorElement}
                open={Boolean(anchorElement)}
                onClose={closeMenu}
            >
                {isSignedIn ? (
                    [
                        <MenuItem key="reservations" onClick={openReservations}>
                            {translate("userMenu.myReservations")}
                        </MenuItem>,
                        <MenuItem key="sign-out" onClick={signOut}>
                            {translate("userMenu.signOut")}
                        </MenuItem>,
                    ]
                ) : (
                    <MenuItem onClick={signIn}>
                        {translate("userMenu.signIn")}
                    </MenuItem>
                )}
            </Menu>

            <Dialog open={reservationsOpen} onClose={() => setReservationsOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ pb: 1 }}>
                    {translate("userMenu.myReservationsTitle")}
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    {sortedReservations.length ? (
                        <Stack spacing={2} divider={<Divider />}>
                            {sortedReservations.map((reservation) => (
                                <Stack key={reservation.id} spacing={0.5}>
                                    <Typography variant="h6" component="p">
                                        {translate("reservation.tableLabel", { tableNumber: reservation.tableNumber })}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {dayjs(reservation.start).format(translate("reservation.dateFormat"))}
                                    </Typography>
                                    <Typography>
                                        {dayjs(reservation.start).format(translate("reservation.timeFormat"))} - {dayjs(reservation.end).format(translate("reservation.timeFormat"))}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    ) : (
                        <Typography color="text.secondary">
                            {translate("userMenu.emptyReservations")}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button variant="contained" color="primary" onClick={() => setReservationsOpen(false)}>
                        {translate("reservation.notification.closeButton")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default UserMenu;
